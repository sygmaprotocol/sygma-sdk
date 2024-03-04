import {
  EVMAssetTransfer,
  Environment,
  getTransferStatusData,
  TransferStatusResponse
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const ROCOCO_PHALA_CHAIN_ID = 5231;
const DESTINATION_ADDRESS = "5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt";
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001100";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://gateway.tenderly.co/public/sepolia"
const getStatus = async (
  txHash: string
): Promise<TransferStatusResponse[]> => {
    const data = await getTransferStatusData(Environment.TESTNET, txHash);
    return data as TransferStatusResponse[];
};

export async function erc20Transfer(): Promise<void> {
  const provider = new providers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(privateKey ?? "", provider);
  const assetTransfer = new EVMAssetTransfer();
  await assetTransfer.init(provider, Environment.TESTNET);

  const transfer = await assetTransfer.createFungibleTransfer(
    await wallet.getAddress(),
    ROCOCO_PHALA_CHAIN_ID,
    DESTINATION_ADDRESS,
    RESOURCE_ID,
    "500000000000000000" // 18 decimal places
    // optional parachainID (e.g. KusamaParachain.SHIDEN)
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

  const id = setInterval(() => {
    getStatus(response.hash)
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
}

erc20Transfer().finally(() => {});
