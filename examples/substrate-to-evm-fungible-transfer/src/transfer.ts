import { Keyring } from "@polkadot/keyring";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import dotenv from "dotenv";
import {
  Environment,
  Substrate,
  getTransferStatusData,
  TransferStatusResponse
} from "@buildwithsygma/sygma-sdk-core";

dotenv.config();

const { SubstrateAssetTransfer } = Substrate;

const SEPOLIA_CHAIN_ID = 11155111;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001100";
const MNEMONIC = process.env.PRIVATE_MNEMONIC;
const recipient = "0xD31E89feccCf6f2DE10EaC92ADffF48D802b695C";
const RHALA_RPC_URL = process.env.RHALA_RPC_URL || "wss://rhala-node.phala.network/ws"
if (!MNEMONIC) {
  throw new Error("Missing environment variable: PRIVATE_MNEMONIC");
}

const getStatus = async (
  txHash: string
): Promise<TransferStatusResponse[]> => {
    const data = await getTransferStatusData(Environment.TESTNET, txHash);
    return data as TransferStatusResponse[];
};

const substrateTransfer = async (): Promise<void> => {
  const keyring = new Keyring({ type: "sr25519" });
  // Make sure to fund this account with native tokens
  // Account address: 5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS

  await cryptoWaitReady();

  const account = keyring.addFromUri(MNEMONIC);

  const wsProvider = new WsProvider(RHALA_RPC_URL);
  const api = await ApiPromise.create({ provider: wsProvider });

  const assetTransfer = new SubstrateAssetTransfer();

  await assetTransfer.init(api, Environment.TESTNET);

  const transfer = await assetTransfer.createFungibleTransfer(
    account.address,
    SEPOLIA_CHAIN_ID,
    recipient,
    RESOURCE_ID,
    "5000000" // 6 decimal places
  );

  const fee = await assetTransfer.getFee(transfer);

  const transferTx = assetTransfer.buildTransferTransaction(transfer, fee);

  const unsub = await transferTx.signAndSend(account, ({ status }) => {
    console.log(`Current status is ${status.toString()}`);

    if (status.isInBlock) {
      console.log(
        `Transaction included at blockHash ${status.asInBlock.toString()}`
      );
    } else if (status.isFinalized) {
      console.log(
        `Transaction finalized at blockHash ${status.asFinalized.toString()}`
      );
      unsub();
    }

    const id = setInterval(() => {
      getStatus(status.asInBlock.toString())
        .then((data) => {
          if (data[0]) {
            console.log("Status of the transfer", data[0].status);
            if(data[0].status == "executed") {
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
