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
import { Utxo, broadcastTransaction, calculateFee, getFeeEstimates, getLastConfirmedUTXO, getTweakedSigner, toXOnly } from './utils';

dotenv.config();

const DESTINATION_ADDRESS = process.env.DESTINATION_ADDRESS;
const DESTINATION_DOMAIN_ID = Number(process.env.DESTINATION_DOMAIN_ID);
const BLOCKSTREAM_URL = process.env.BLOCKSTREAM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RESOURCE_ID = process.env.RESOURCE_ID;
const SOURCE_DOMAIN_ID = Number(process.env.SOURCE_DOMAIN_ID);

if (!DESTINATION_ADDRESS || !PRIVATE_KEY || !DESTINATION_DOMAIN_ID || !BLOCKSTREAM_URL || !RESOURCE_ID || !SOURCE_DOMAIN_ID) {
  throw new Error('Please provide DESTINATION_ADDRESS or PRIVATE_KEY or DOMAIN_ID or BLOCKSTREAM_URL or RESOURCE_ID in .env file');
}

async function btcToEvmTransfer(): Promise<void> {
  // pre setup
  const testnet = networks.testnet;
  initEccLib(tinysecp as any);
  const ECPair: ECPairAPI = ECPairFactory(tinysecp);

  // Transfer BTC to EVM
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
  console.log('taproot address', p2pktrAdddress)

  // Get for UTXO
  const utxoData: Utxo = await getLastConfirmedUTXO(BLOCKSTREAM_URL!, p2pktrAdddress);
  const feeEstimatesPerBlockConfirmation = await getFeeEstimates(BLOCKSTREAM_URL!);

  const params = {
    sourceDomain: SOURCE_DOMAIN_ID,
    destinationAddress: DESTINATION_ADDRESS,
    amount: utxoData.value,
    resource: RESOURCE_ID
  }
  const transfer = await createBitcoinFungibleTransfer(params);

  const transferRequestData = transfer.getBTCTransferRequest();
  console.log('Transfer Request Data:', transferRequestData);

  const psbt = new Psbt({ network: testnet });

  const data = Buffer.from(
    `${DESTINATION_ADDRESS}_${DESTINATION_DOMAIN_ID}`, // EMV ADDRESS + DESTINATION DOMAIN ID HERE
    "utf8",
  );

  const embed = payments.embed({ data: [data] });

  const feeValue = calculateFee(psbt, feeEstimatesPerBlockConfirmation, {
    hash: utxoData.txid,
    index: utxoData.vout,
    witnessUtxo: { value: utxoData.value, script: p2pktr.output! },
    tapInternalKey: toXOnly(publicKey)
  }, {
    script: embed.output!,
    value: 0,
  }, {
    address: transferRequestData.depositAddress,
    value: utxoData.value - transferRequestData.amount
  }, tweakedSigner);

  console.log('feeValue', feeValue, transferRequestData.amount, utxoData.value /2, transferRequestData.amount - feeValue)

  const psbtWithFee = new Psbt({ network: testnet });

  psbtWithFee.addInput({
    hash: utxoData.txid,
    index: utxoData.vout,
    witnessUtxo: { value: utxoData.value, script: p2pktr.output! },
    tapInternalKey: toXOnly(publicKey)
  });

  psbtWithFee.addOutput({
    script: embed.output!,
    value: 0,
  });

  psbtWithFee.addOutput({
    address: transferRequestData.depositAddress,
    value: transferRequestData.amount - feeValue
  });

  psbtWithFee.signInput(0, tweakedSigner);
  psbtWithFee.finalizeAllInputs();

  const tx = psbtWithFee.extractTransaction(true);

  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  const txid = await broadcastTransaction(BLOCKSTREAM_URL!, tx.toHex());

  console.log(`Transaction ID: ${txid}`);
}

btcToEvmTransfer().finally(() => { })