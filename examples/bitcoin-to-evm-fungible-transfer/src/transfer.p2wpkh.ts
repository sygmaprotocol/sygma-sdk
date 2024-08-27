import type { BitcoinTransferParams, UTXOData } from "@buildwithsygma/bitcoin";
import {
  createBitcoinFungibleTransfer,
  TypeOfAddress,
} from "@buildwithsygma/bitcoin";
import { BIP32Factory } from "bip32";
import { mnemonicToSeed } from "bip39";
import { initEccLib, networks } from "bitcoinjs-lib";
import dotenv from "dotenv";
import * as tinysecp from "tiny-secp256k1";

import {
  calculateSize,
} from "./blockstreamApi.js";
import { broadcastTransaction, fetchUTXOS, getFeeEstimates, processUtxos } from "@buildwithsygma/utils";

dotenv.config();

const DESTINATION_CHAIN_ID = 11155111;
const {
  SOURCE_CAIPID,
  DESTINATION_ADDRESS,
  RESOURCE_ID,
  BLOCKSTREAM_URL,
  EXPLORER_URL,
  MNEMONIC,
  DERIVATION_PATH,
  ADDRESS,
  AMOUNT,
} = process.env;

if (
  !SOURCE_CAIPID ||
  !DESTINATION_ADDRESS ||
  !RESOURCE_ID ||
  !MNEMONIC ||
  !DERIVATION_PATH ||
  !ADDRESS ||
  !BLOCKSTREAM_URL ||
  !AMOUNT
) {
  throw new Error(
    "Missing required environment variables, please make sure .env file exists."
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

  const feeRate = await getFeeEstimates('5');
  const utxos = await fetchUTXOS(ADDRESS as unknown as string);

  const processedUtxos = processUtxos(utxos, AMOUNT);

  const mapedUtxos = processedUtxos.map((utxo) => ({
    utxoTxId: utxo.txid,
    utxoOutputIndex: utxo.vout,
    utxoAmount: BigInt(utxo.value),
  })) as unknown as UTXOData[];

  const size = calculateSize({
    utxoData: mapedUtxos,
    network: networks.testnet,
    publicKey: derivedNode.publicKey,
    depositAddress: ADDRESS as unknown as string,
    domainId: DESTINATION_CHAIN_ID,
    amount: AMOUNT,
    feeValue: BigInt(0),
    changeAddress: ADDRESS as unknown as string,
    signer: derivedNode,
    typeOfAddress: TypeOfAddress.P2WPKH,
  }); // aprox estimation of the size of the tx

  const transferParams: BitcoinTransferParams = {
    source: SOURCE_CAIPID,
    destination: DESTINATION_CHAIN_ID,
    destinationAddress: DESTINATION_ADDRESS,
    amount: AMOUNT,
    resource: RESOURCE_ID,
    utxoData: mapedUtxos,
    publicKey: derivedNode.publicKey,
    typeOfAddress: TypeOfAddress.P2WPKH,
    network: networks.testnet,
    changeAddress: ADDRESS,
    feeRate: BigInt(Math.ceil(feeRate)),
    size: BigInt(size),
  };

  const transfer = await createBitcoinFungibleTransfer(transferParams);

  const psbt = transfer.getTransferTransaction();

  console.log("Signing the transaction");

  psbt.signAllInputs(derivedNode);
  psbt.finalizeAllInputs();

  console.log("Extracting the transaction");
  const tx = psbt.extractTransaction(true);
  console.log("Transaction hex", tx.toHex());

  const txId = await broadcastTransaction(tx.toHex());
  console.log("Transaction broadcasted", `${EXPLORER_URL}/tx/${txId}`);
}

btcToEvmTransfer().finally(() => { });
