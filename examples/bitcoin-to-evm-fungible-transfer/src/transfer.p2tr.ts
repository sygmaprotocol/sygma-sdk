import {
  createBitcoinFungibleTransfer,
  TypeOfAddress,
} from "@buildwithsygma/bitcoin";
import type { BitcoinTransferParams, UTXOData } from "@buildwithsygma/bitcoin";
import { BIP32Factory } from "bip32";
import { initEccLib, networks, Signer } from "bitcoinjs-lib";
import dotenv from "dotenv";
import * as tinysecp from "tiny-secp256k1";
import { broadcastTransaction, fetchUTXOS, getFeeEstimates, getPublicKey, processUtxos } from '@buildwithsygma/utils'

import {
  calculateSize,
} from "./blockstreamApi.js";

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

  const { tweakedSigner, publicKeyDropedDERHeader  } = await getPublicKey({
    bip32,
    mnemonic: MNEMONIC as string,
    derivationPath: DERIVATION_PATH as string,
    network: networks.testnet,
    typeOfAddress: TypeOfAddress.P2TR
  }
  ) as { publicKeyDropedDERHeader: Buffer, tweakedSigner: Signer };

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
    amount: AMOUNT,
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
