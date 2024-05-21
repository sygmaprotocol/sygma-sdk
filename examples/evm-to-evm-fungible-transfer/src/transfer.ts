import {
  Environment,
  getTransferStatus,
  TransferStatusResponse
} from "@buildwithsygma/core";
import {
  createEvmFungibleAssetTransfer
} from "@buildwithsygma/evm";
import dotenv from "dotenv";
import { Wallet } from "ethers";
import Web3 from "web3";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const SEPOLIA_CHAIN_ID = 11155111;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000300";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/8aa64403febb43359abf4c05b735dbbc"
const getStatus = async (
  txHash: string
): Promise<TransferStatusResponse> => {
    const data = await getTransferStatus(txHash, Environment.TESTNET);
    return data as TransferStatusResponse;
};

export async function erc20Transfer(): Promise<void> {
  const web3Provider = new Web3.providers.HttpProvider(SEPOLIA_RPC_URL);

  const wallet = new Wallet(privateKey ?? "", );
  const destinationAddress = await wallet.getAddress();

  const params = {
    source: SEPOLIA_CHAIN_ID,
    destination: 17000,
    sourceNetworkProvider: web3Provider,
    resource: RESOURCE_ID,
    amount: BigInt(2) * BigInt(1e18),
    destinationAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
    environment: Environment.DEVNET
  };

  const transfer = await createEvmFungibleAssetTransfer(params)
  transfer.setSigner(wallet)

  // const assetTransfer = new EVMAssetTransfer();
  // // @ts-ignore-next-line
  // await assetTransfer.init(provider, Environment.TESTNET);

  // const transfer = await assetTransfer.createFungibleTransfer(
  //   await wallet.getAddress(),
  //   SEPOLIA_CHAIN_ID,
  //   await wallet.getAddress(), // Sending to the same address on a different chain
  //   RESOURCE_ID,
  //   "5000000000000000000" // 18 decimal places
  // );

  // const fee = await transfer.getFee();
  const approvals = await transfer.getApprovalTransactions();
  for (const approval of approvals) {
    // const response = await wallet.sendTransaction(
    //   approval as providers.TransactionRequest
    // );
    console.log("tx: ", approval.data);
  }

  const transferTx = await transfer.getTransferTransaction();
  console.log("tx: ", transferTx.data);
  // const response = await wallet.sendTransaction(
  //   transferTx as providers.TransactionRequest
  // );
  // console.log("Sent transfer with hash: ", response.hash);

  // const id = setInterval(() => {
  //   getStatus(response.hash)
  //     .then((data) => {
  //       if (data) {
  //         console.log("Status of the transfer", data.status);
  //         if(data.status == "executed") {
  //           clearInterval(id);
  //           process.exit(0);
  //         }
  //       } else {
  //         console.log("Waiting for the TX to be indexed");
  //       }
  //     })
  //     .catch((e) => {
  //       console.log("error:", e);
  //     });
  // }, 5000);
}

erc20Transfer().finally(() => {});
