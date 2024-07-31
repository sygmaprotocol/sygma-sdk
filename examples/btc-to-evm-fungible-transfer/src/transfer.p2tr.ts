import type { BaseTransferParams } from "@buildwithsygma/btc";
import {
  createBitcoinFungibleTransfer,
  TypeOfAddress,
} from "@buildwithsygma/btc";
import { BIP32Factory } from "bip32";
import { mnemonicToSeed } from "bip39";
import { crypto, initEccLib, networks } from "bitcoinjs-lib";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import dotenv from "dotenv";
import * as tinysecp from "tiny-secp256k1";
import { broadcastTransaction, getFeeEstimates } from "./blockstream-api";

dotenv.config();

const SOURCE_CAIPID = process.env.SOURCE_CAIPID;
const DESTINATION_ADDRESS = process.env.DESTINATION_ADDRESS;
const DESTINATION_CHAIN_ID = Number(process.env.DESTINATION_CHAIN_ID);
const RESOURCE_ID = process.env.RESOURCE_ID;
const BLOCKSTREAM_URL = process.env.BLOCKSTREAM_URL;
const EXPLORER_URL = process.env.EXPLORER_URL;
const MNEMONIC = process.env.MNEMONIC;
const UTXO_TX_ID = process.env.UTXO_TX_ID;
const UTXO_AMOUNT = Number(process.env.UTXO_AMOUNT);
const UTXO_OUTPUT_INDEX = Number(process.env.UTXO_OUTPUT_INDEX);
const DERIVATION_PATH = process.env.DERIVATION_PATH;
const CHANGE_ADDRESS = process.env.CHANGE_ADDRESS;
const AMOUNT = Number(process.env.AMOUNT);

if (
  !SOURCE_CAIPID ||
  !DESTINATION_ADDRESS ||
  !DESTINATION_CHAIN_ID ||
  !RESOURCE_ID ||
  !MNEMONIC ||
  !UTXO_TX_ID ||
  !UTXO_AMOUNT ||
  !UTXO_OUTPUT_INDEX ||
  !DERIVATION_PATH ||
  !CHANGE_ADDRESS ||
  !BLOCKSTREAM_URL ||
  !AMOUNT
) {
  throw new Error(
    "Please provided needed env variables needed into the .env file",
  );
}


async function btcToEvmTransfer(): Promise<void> {
  // pre setup
  initEccLib(tinysecp);
  const bip32 = BIP32Factory(tinysecp);
  console.log("Transfer BTC to EVM");
  const seed = await mnemonicToSeed(MNEMONIC);
  const rootKey = bip32.fromSeed(seed, networks.testnet);
  const derivedNode = rootKey.derivePath(DERIVATION_PATH);

  // Note: default example is going to run P2TR transfer
  const publicKeyDropedDERHeader = toXOnly(derivedNode.publicKey);

  const tweakedSigner = derivedNode.tweak(
    crypto.taggedHash("TapTweak", publicKeyDropedDERHeader),
  );

  const feeRate = await getFeeEstimates(BLOCKSTREAM_URL);

  const transferParams: BaseTransferParams = {
    source: SOURCE_DOMAIN_CAIPID,
    destination: DESTINATION_DOMAIN_CHAIN_ID,
    destinationAddress: DESTINATION_ADDRESS,
    amount: AMOUNT,
    resource: RESOURCE_ID,
    utxoData: {
      utxoTxId: UTXO_TX_ID,
      utxoOutputIndex: UTXO_OUTPUT_INDEX,
      utxoAmount: UTXO_AMOUNT,
    },
    feeRate,
    publicKey: publicKeyDropedDERHeader,
    typeOfAddress: TypeOfAddress.P2TR,
    network: networks.testnet,
    changeAddress: CHANGE_ADDRESS,
  };

  const transfer = await createBitcoinFungibleTransfer(transferParams);

  const psbt = transfer.getTransferTransaction();

  console.log("Signing the transaction");

  psbt.signInput(0, tweakedSigner);
  psbt.finalizeAllInputs();

  console.log("Extracting the transaction");
  const tx = psbt.extractTransaction(true);
  console.log("Transaction hex", tx.toHex());

  const txId = await broadcastTransaction(BLOCKSTREAM_URL, tx.toHex());
  console.log("Transaction broadcasted", `${EXPLORER_URL}/tx/${txId}`);
}

btcToEvmTransfer().finally(() => {});
