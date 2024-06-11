import { Environment, getTransferStatus } from "@buildwithsygma/core/types";
import {
  createSubstrateFungibleAssetTransfer,
  SubstrateAssetTransferRequest,
} from "@buildwithsygma/substrate/src";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import dotenv from "dotenv";

dotenv.config();

const SEPOLIA_CHAIN_ID = 11155111;
const PHALA_CHAIN_ID = 5231;
const RESOURCE_ID_SYGMA_USD =
  "0x0000000000000000000000000000000000000000000000000000000000001100";
const MNEMONIC = process.env.PRIVATE_MNEMONIC;
const recipient = "0xD31E89feccCf6f2DE10EaC92ADffF48D802b695C";
const RHALA_RPC_URL =
  process.env.RHALA_RPC_URL || "wss://rhala-node.phala.network/ws";
if (!MNEMONIC) {
  throw new Error("Missing environment variable: PRIVATE_MNEMONIC");
}

const substrateTransfer = async (): Promise<void> => {
  // Make sure to fund this account with native tokens
  // Account address: 5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS
  const keyring = new Keyring({ type: "sr25519" });
  await cryptoWaitReady();
  const account = keyring.addFromUri(MNEMONIC);
  const wsProvider = new WsProvider(RHALA_RPC_URL);
  const api = await ApiPromise.create({ provider: wsProvider });

  const transferParams = {
    sourceDomain: PHALA_CHAIN_ID,
    destinationDomain: SEPOLIA_CHAIN_ID,
    sourceNetworkProvider: api,
    resource: RESOURCE_ID_SYGMA_USD,
    amount: BigInt("5000000"),
    destinationAddress: account.address || recipient,
  } as SubstrateAssetTransferRequest;

  const transfer = await createSubstrateFungibleAssetTransfer(transferParams);
  const transferTx = await transfer.getTransferTransaction();

  const unsub = await transferTx.signAndSend(account, ({ status }) => {
    console.log(`Current status is ${status.toString()}`);

    if (status.isInBlock) {
      console.log(
        `Transaction included at blockHash ${status.asInBlock.toString()}`,
      );
    } else if (status.isFinalized) {
      console.log(
        `Transaction finalized at blockHash ${status.asFinalized.toString()}`,
      );
      unsub();
    }

    const id = setInterval(() => {
      getTransferStatus(status.asInBlock.toString(), Environment.TESTNET)
        .then((data) => {
          if (data) {
            console.log("Status of the transfer", data.status);
            if (data.status == "executed") {
              clearInterval(id);
              process.exit(0);
            }
          } else {
            console.log("Waiting for the TX to be indexed");
          }
        })
        .catch((e) => {
          console.log("error:", e);
        });
    }, 5000);
  });
};

substrateTransfer()
  .catch((e) => console.log(e))
  .finally(() => {});
