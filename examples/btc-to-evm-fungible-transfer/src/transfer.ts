import dotenv from 'dotenv';
import { createBitcoinFungibleTransfer } from '@buildwithsygma/btc';
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from 'ecpair';
import {
  initEccLib,
  networks,
  payments,
  Psbt
} from "bitcoinjs-lib";
import * as tinysecp from 'tiny-secp256k1';
import { Utxo, broadcastTransaction, getLastUtxo, getTweakedSigner, toXOnly } from './utils';

dotenv.config();

const DESTINATION_ADDRESS = process.env.DESTINATION_ADDRESS;
const DOMAIN_ID = process.env.DOMAIN_ID;
const BLOCKSTREAM_URL = process.env.BLOCKSTREAM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!DESTINATION_ADDRESS || !PRIVATE_KEY || !DOMAIN_ID || !BLOCKSTREAM_URL) {
  throw new Error('Please provide DESTINATION_ADDRESS or PRIVATE_KEY or DOMAIN_ID or BLOCKSTREAM_URL in .env file');
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
  const utxoData: Utxo = await getLastUtxo(BLOCKSTREAM_URL!, p2pktrAdddress);

  const params = {
    sourceDomain: 3, // current Domain Id for the BTC domain on devnet
    destinationAddress: DESTINATION_ADDRESS,
    amount: utxoData.value,
    resource: '0x0000000000000000000000000000000000000000000000000000000000000300' // resource id for BTC
  }
  const transfer = await createBitcoinFungibleTransfer(params);

  const transferRequestData = transfer.getBTCTransferRequest();
  console.log('Transfer Request Data:', transferRequestData);

  const psbt = new Psbt({ network: testnet });

  psbt.addInput({
    hash: utxoData.txid,
    index: utxoData.vout,
    witnessUtxo: { value: utxoData.value, script: p2pktr.output! },
    tapInternalKey: toXOnly(publicKey)
  });

  const data = Buffer.from(
    `${DESTINATION_ADDRESS}_${DOMAIN_ID}`, // EMV ADDRESS + DESTINATION DOMAIN ID HERE
    "utf8",
  );

  const embed = payments.embed({ data: [data] });

  psbt.addOutput({
    script: embed.output!,
    value: 0,
  });

  psbt.addOutput({
    address: transferRequestData.depositAddress,
    value: transferRequestData.amount - (161830)
  });

  psbt.signInput(0, tweakedSigner);
  psbt.finalizeAllInputs();

  const tx = psbt.extractTransaction(true);

  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  const txid = await broadcastTransaction(BLOCKSTREAM_URL!, tx.toHex());

  console.log(`Transaction ID: ${txid}`);
}

btcToEvmTransfer().finally(() => {})