import {
  createBitcoinFungibleTransfer,
  TypeOfAddress,
} from "@buildwithsygma/bitcoin";
import type { BitcoinTransferParams, UTXOData } from "@buildwithsygma/bitcoin";
import { BIP32Factory } from "bip32";
import { mnemonicToSeed } from "bip39";
import { crypto, initEccLib, networks } from "bitcoinjs-lib";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import dotenv from "dotenv";
import * as tinysecp from "tiny-secp256k1";
import { broadcastTransaction, fetchUTXOS, getFeeEstimates, processUtxos } from '@buildwithsygma/utils'

import {
  calculateSize,
} from "./blockstreamApi.js";

dotenv.config();

const SOURCE_CAIPID = process.env.SOURCE_CAIPID;
const DESTINATION_ADDRESS = process.env.DESTINATION_ADDRESS;
const DESTINATION_CHAIN_ID = 11155111;
const RESOURCE_ID = process.env.RESOURCE_ID;
const BLOCKSTREAM_URL = process.env.BLOCKSTREAM_URL;
const EXPLORER_URL = process.env.EXPLORER_URL;
const MNEMONIC = process.env.MNEMONIC;
const DERIVATION_PATH = process.env.DERIVATION_PATH;
const ADDRESS = process.env.ADDRESS;
const AMOUNT = Number(process.env.AMOUNT);

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

  const feeRate = await getFeeEstimates('5');
  const utxos = await fetchUTXOS(
    ADDRESS as unknown as string);

  const processedUtxos = processUtxos(utxos, AMOUNT);

  const mapedUtxos = processedUtxos.map((utxo) => ({
    utxoTxId: utxo.txid,
    utxoOutputIndex: utxo.vout,
    utxoAmount: BigInt(utxo.value),
  })) as unknown as UTXOData[];

  const size = calculateSize({
    utxoData: mapedUtxos,
    network: networks.testnet,
    publicKey: publicKeyDropedDERHeader,
    depositAddress: ADDRESS as unknown as string,
    domainId: DESTINATION_CHAIN_ID,
    amount: BigInt(AMOUNT),
    feeValue: BigInt(0),
    changeAddress: ADDRESS as unknown as string,
    signer: tweakedSigner,
    typeOfAddress: TypeOfAddress.P2TR,
  });

  const transferParams: BitcoinTransferParams = {
    source: SOURCE_CAIPID,
    destination: DESTINATION_CHAIN_ID,
    destinationAddress: DESTINATION_ADDRESS,
    amount: AMOUNT,
    resource: RESOURCE_ID,
    utxoData: mapedUtxos,
    feeRate: BigInt(Math.ceil(feeRate)),
    publicKey: publicKeyDropedDERHeader,
    typeOfAddress: TypeOfAddress.P2TR,
    network: networks.testnet,
    changeAddress: ADDRESS,
    size: BigInt(size),
  };

  const transfer = await createBitcoinFungibleTransfer(transferParams);

  const psbt = transfer.getTransferTransaction();

  console.log("Signing the transaction");

  psbt.signAllInputs(tweakedSigner);
  psbt.finalizeAllInputs();

  console.log("Extracting the transaction");
  const tx = psbt.extractTransaction(true);
  console.log("Transaction hex", tx.toHex());

  const txId = await broadcastTransaction(tx.toHex());
  console.log("Transaction broadcasted", `${EXPLORER_URL}/tx/${txId}`);
}

btcToEvmTransfer().finally(() => { });
