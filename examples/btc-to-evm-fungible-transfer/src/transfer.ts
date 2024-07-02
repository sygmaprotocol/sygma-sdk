import dotenv from 'dotenv';
import { createBitcoinFungibleTransfer } from '@buildwithsygma/btc';
import { ECPairFactory, ECPairAPI } from 'ecpair';
import {
  initEccLib,
  networks,
  payments,
  Psbt
} from "bitcoinjs-lib";
import * as tinysecp from 'tiny-secp256k1';
import { broadcastTransaction, calculateFee, getFeeEstimates, getTweakedSigner, toXOnly } from './utils';

dotenv.config();

const DESTINATION_ADDRESS = process.env.DESTINATION_ADDRESS;
const DESTINATION_DOMAIN_ID = Number(process.env.DESTINATION_DOMAIN_ID);
const BLOCKSTREAM_URL = process.env.BLOCKSTREAM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RESOURCE_ID = process.env.RESOURCE_ID;
const SOURCE_DOMAIN_ID = Number(process.env.SOURCE_DOMAIN_ID);
const FEE_ADDRESS = 'tb1p0r2w3ugreaggd7nakw2wd04up6rl8k0cce8eetxwmhnrelgqx87s4zdkd7'
const FEE_AMOUNT = 1000000;
const EXPLORER_URL = process.env.EXPLORER_URL;

if (!DESTINATION_ADDRESS || !PRIVATE_KEY || !DESTINATION_DOMAIN_ID || !BLOCKSTREAM_URL || !RESOURCE_ID || !SOURCE_DOMAIN_ID) {
  throw new Error('Please provided needed env variavles in .env file');
}

type InputData = {
  hash: string;
  index: number;
  witnessUtxo: { value: number; script: Buffer };
  tapInternalKey: Buffer;
};

async function btcToEvmTransfer(): Promise<void> {
  // pre setup
  const testnet = networks.testnet;
  initEccLib(tinysecp as any);
  const ECPair: ECPairAPI = ECPairFactory(tinysecp);

  console.log('Transfer BTC to EVM');

  // tweaking signer
  const { tweakedSigner, publicKey } = getTweakedSigner(ECPair, tinysecp, testnet, PRIVATE_KEY!);

  // Generate an address from the tweaked public key
  const p2pktr = payments.p2tr({
    pubkey: toXOnly(tweakedSigner.publicKey),
    network: testnet,
  });

  const p2pktrAdddress = p2pktr.address as string;
  // address here should match the one that you generated for your private key
  console.log('Taproot address to use', p2pktrAdddress)

  const feeEstimatesPerBlockConfirmation = await getFeeEstimates(BLOCKSTREAM_URL!);

  /**
   * Get UTXO to use for the transfer
   * You can get UTXO from any source, for this example we are using Blockstream API
   * Add the txid and vout of the UTXO to the inputData. Also add the value of the UTXO to the witnessUtxo value field
   */

  const inputData: InputData = {
    hash: '', // utxo tx id
    index: 0, // utxo index
    witnessUtxo: { value: 0, script: p2pktr.output! }, // utxo value
    tapInternalKey: toXOnly(publicKey)
  };

  const params = {
    sourceDomain: SOURCE_DOMAIN_ID,
    destinationAddress: DESTINATION_ADDRESS,
    amount: inputData.witnessUtxo.value,
    resource: RESOURCE_ID
  }

  const transfer = await createBitcoinFungibleTransfer(params);

  const transferRequestData = transfer.getBTCTransferRequest();

  const psbt = new Psbt({ network: testnet });

  // encoded data
  const data = Buffer.from(
    `${DESTINATION_ADDRESS}_${DESTINATION_DOMAIN_ID}`, // EMV ADDRESS + DESTINATION DOMAIN ID HERE
    "utf8",
  );

  const embed = payments.embed({ data: [data] });

  const amount = transferRequestData.amount - (16183 + 1000)
  const amountMinusBridgeFee = amount - FEE_AMOUNT;

  const outputEncodedData = {
    script: embed.output!,
    value: 0,
  };
  
  const outputData = {
    address: transferRequestData.depositAddress,
    value: amountMinusBridgeFee
  };
  
  const outputDataFee = {
    address: FEE_ADDRESS,
    value: FEE_AMOUNT
  };
  
  const feeValue = calculateFee(psbt, feeEstimatesPerBlockConfirmation, inputData, outputEncodedData, outputData, outputDataFee, tweakedSigner);

  const psbtWithFee = new Psbt({ network: testnet });

  const amountWitFeeApplied = amount - feeValue - FEE_AMOUNT;
  
  psbtWithFee.addInput(inputData);

  psbtWithFee.addOutput(outputEncodedData);

  psbtWithFee.addOutput(outputDataFee);

  psbtWithFee.addOutput({
    address: transferRequestData.depositAddress,
    value: amountWitFeeApplied
  });

  psbtWithFee.signInput(0, tweakedSigner);
  psbtWithFee.finalizeAllInputs();

  const tx = psbtWithFee.extractTransaction(true);

  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  const txid = await broadcastTransaction(BLOCKSTREAM_URL!, tx.toHex());

  console.log(`Transaction ID: ${EXPLORER_URL}/${txid}`);
}

btcToEvmTransfer().finally(() => { })