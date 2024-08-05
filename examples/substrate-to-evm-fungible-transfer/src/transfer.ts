import type { SubstrateAssetTransferRequest } from "@buildwithsygma/substrate";
import { createSubstrateFungibleAssetTransfer } from "@buildwithsygma/substrate";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import dotenv from "dotenv";

dotenv.config();

const MNEMONIC = process.env.PRIVATE_MNEMONIC;
if (!MNEMONIC) {
  throw new Error("Missing environment variable: PRIVATE_MNEMONIC");
}

const SEPOLIA_CHAIN_ID = 11155111;
const RHALA_CHAIN_ID = 5231;

const RESOURCE_ID_SYGMA_USD =
  "0x0000000000000000000000000000000000000000000000000000000000001100";
const recipient = "0x98729c03c4D5e820F5e8c45558ae07aE63F97461";
const RHALA_RPC_URL =
  process.env.RHALA_RPC_URL ?? "wss://rhala-node.phala.network/ws";

const SYGMA_EXPLORER_URL = "https://scan.test.buildwithsygma.com";
const getSygmaExplorerTransferUrl = (params: {
  blockNumber: number;
  extrinsicIndex: number;
}): string =>
  `${SYGMA_EXPLORER_URL}/transfer/${params.blockNumber}-${params.extrinsicIndex}`;

const substrateTransfer = async (): Promise<void> => {
  // Make sure to account with native tokens
  const keyring = new Keyring({ type: "sr25519" });
  await cryptoWaitReady();
  const account = keyring.addFromUri(MNEMONIC);
  const wsProvider = new WsProvider(RHALA_RPC_URL);
  const api = await ApiPromise.create({ provider: wsProvider });

  const transferParams: SubstrateAssetTransferRequest = {
    sourceDomain: RHALA_CHAIN_ID,
    destinationDomain: SEPOLIA_CHAIN_ID,
    sourceNetworkProvider: api,
    resource: RESOURCE_ID_SYGMA_USD,
    amount: BigInt("5000000"),
    destinationAddress: recipient,
  };

  const transfer = await createSubstrateFungibleAssetTransfer(transferParams);
  const transferTx = await transfer.getTransferTransaction();

  const unsub = await transferTx.signAndSend(account, (results) => {
    const { status } = results;
    console.log(`Current status is ${status.toString()}`);

    if (status.isInBlock) {
      console.log(
        `Transaction included at blockHash ${status.asInBlock.toString()}`,
      );
    } else if (status.isFinalized) {
      const blockNumber = results.blockNumber.toNumber();
      const extrinsicIndex = results.txIndex;

      console.log(
        `Transaction finalized at blockHash ${status.asFinalized.toString()}`,
      );
      console.log(
        `Explorer URL: ${getSygmaExplorerTransferUrl({ blockNumber, extrinsicIndex })}`,
      );
      unsub();
      process.exit(0);
    }
  });
};

substrateTransfer()
  .catch((e) => console.log(e))
  .finally(() => {});
