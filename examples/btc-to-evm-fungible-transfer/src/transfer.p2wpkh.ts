import type { BaseTransferParams } from "@buildwithsygma/btc";
import {
  createBitcoinFungibleTransfer,
  TypeOfAddress,
} from "@buildwithsygma/btc";
import { BIP32Factory } from "bip32";
import { mnemonicToSeed } from "bip39";
import { initEccLib, networks } from "bitcoinjs-lib";
import dotenv from "dotenv";
import * as tinysecp from "tiny-secp256k1";
import { broadcastTransaction, getFeeEstimates } from "./utils";

dotenv.config();

const SOURCE_DOMAIN_CAIPID = process.env.SOURCE_DOMAIN_CAIPID;
const DESTINATION_ADDRESS = process.env.DESTINATION_ADDRESS;
const DESTINATION_DOMAIN_CHAIN_ID = Number(
  process.env.DESTINATION_DOMAIN_CHAIN_ID,
);
const RESOURCE_ID = process.env.RESOURCE_ID;
const BLOCKSTREAM_URL = process.env.BLOCKSTREAM_URL;
const EXPLORER_URL = process.env.EXPLORER_URL;
const MNEMONIC = process.env.MNEMONIC;
const MINER_FEE = Number(process.env.MINER_FEE);
const UTXO_TX_ID = process.env.UTXO_TX_ID;
const UTXO_AMOUNT = Number(process.env.UTXO_AMOUNT);
const UTXO_OUTPUT_INDEX = Number(process.env.UTXO_OUTPUT_INDEX);
const DERIVATION_PATH = process.env.DERIVATION_PATH;
const CHANGE_ADDRESS = process.env.CHANGE_ADDRESS;

if (
  !SOURCE_DOMAIN_CAIPID ||
  !DESTINATION_ADDRESS ||
  !DESTINATION_DOMAIN_CHAIN_ID ||
  !RESOURCE_ID ||
  !MNEMONIC ||
  !MINER_FEE ||
  !UTXO_TX_ID ||
  !UTXO_AMOUNT ||
  !UTXO_OUTPUT_INDEX ||
  !DERIVATION_PATH ||
  !CHANGE_ADDRESS ||
  !BLOCKSTREAM_URL
) {
  throw new Error(
    "Please provided needed env variables needed into the .env file",
  );
}

initEccLib(tinysecp);
const bip32 = BIP32Factory(tinysecp);

async function btcToEvmTransfer(): Promise<void> {
  // pre setup
  const testnet = networks.testnet;
  console.log("Transfer BTC to EVM");
  const seed = await mnemonicToSeed(MNEMONIC);
  const rootKey = bip32.fromSeed(seed, testnet);
  const derivedNode = rootKey.derivePath(DERIVATION_PATH);

  const feeRate = await getFeeEstimates(BLOCKSTREAM_URL);

  const transferParams: BaseTransferParams = {
    source: SOURCE_DOMAIN_CAIPID,
    destination: DESTINATION_DOMAIN_CHAIN_ID,
    destinationAddress: DESTINATION_ADDRESS,
    amount: 150000000,
    resource: RESOURCE_ID,
    utxoData: {
      utxoTxId: UTXO_TX_ID,
      utxoOutputIndex: UTXO_OUTPUT_INDEX,
      utxoAmount: UTXO_AMOUNT,
    },
    publicKey: derivedNode.publicKey,
    typeOfAddress: TypeOfAddress.P2WPKH,
    minerFee: MINER_FEE,
    network: testnet,
    changeAddress: CHANGE_ADDRESS,
    feeRate,
  };

  const transfer = await createBitcoinFungibleTransfer(transferParams);

  const psbt = transfer.getTransferTransaction();

  console.log("Signing the transaction");

  psbt.signInput(0, derivedNode);
  psbt.finalizeAllInputs();

  console.log("Extracting the transaction");
  const tx = psbt.extractTransaction(true);
  console.log("Transaction hex", tx.toHex());

  const txId = await broadcastTransaction(BLOCKSTREAM_URL, tx.toHex());
  console.log("Transaction broadcasted", `${EXPLORER_URL}/tx/${txId}`);
}

btcToEvmTransfer().finally(() => {});
