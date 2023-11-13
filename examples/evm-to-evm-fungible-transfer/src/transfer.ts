import {
  EVMAssetTransfer,
  Environment,
  getTransferStatusData,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const SEPOLIA_CHAIN_ID = 11155111;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000300";

const getStatus = async (
  txHash: string
): Promise<{ status: string; explorerUrl: string } | void> => {
  try {
    const data = await getTransferStatusData(Environment.TESTNET, txHash);

    return data as { status: string; explorerUrl: string };
  } catch (e) {
    console.log("error:", e);
  }
};

export async function erc20Transfer(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://rpc.goerli.eth.gateway.fm/"
  );
  const wallet = new Wallet(privateKey ?? "", provider);
  const assetTransfer = new EVMAssetTransfer();
  // @ts-ignore-next-line
  await assetTransfer.init(provider, Environment.TESTNET);

  const transfer = await assetTransfer.createFungibleTransfer(
    await wallet.getAddress(),
    SEPOLIA_CHAIN_ID,
    await wallet.getAddress(), // Sending to the same address on a different chain
    RESOURCE_ID,
    "50000000000000000000" // 18 decimal places
  );

  const fee = await assetTransfer.getFee(transfer);
  const approvals = await assetTransfer.buildApprovals(transfer, fee);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(
      approval as providers.TransactionRequest
    );
    console.log("Sent approval with hash: ", response.hash);
  }
  const transferTx = await assetTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest
  );
  console.log("Sent transfer with hash: ", response.hash);

  let dataResponse: undefined | { status: string; explorerUrl: string };

  const id = setInterval(() => {
    getStatus(response.hash)
      .then((data) => {
        if (data) {
          dataResponse = data;
          console.log("Status of the transfer", data.status);
        }
      })
      .catch((e) => {
        console.log("error:", e);
        console.log("Transfer still not indexed, retrying...");
      });

    if (dataResponse && dataResponse.status === "executed") {
      console.log("Transfer executed successfully");
      clearInterval(id);
      process.exit(0);
    }
  }, 5000);
}

erc20Transfer().finally(() => {});
