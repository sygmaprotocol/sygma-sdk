import { Environment, } from "@buildwithsygma/core";
import { createEvmFungibleAssetTransfer } from "@buildwithsygma/evm";
import dotenv from "dotenv";
import { Wallet, providers } from "ethers";
import Web3HttpProvider from "web3-providers-http";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const SEPOLIA_CHAIN_ID = 11155111;
const HOLESKY_CHAIN_ID = 17000; 
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000300";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/8aa64403febb43359abf4c05b735dbbc"

export async function erc20Transfer(): Promise<void> {
  const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
  const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
  const wallet = new Wallet(privateKey ?? "", ethersWeb3Provider);
  const destinationAddress = await wallet.getAddress();

  const params = {
    source: SEPOLIA_CHAIN_ID,
    destination: HOLESKY_CHAIN_ID,
    sourceNetworkProvider: web3Provider,
    resource: RESOURCE_ID,
    amount: BigInt(2) * BigInt(1e18),
    destinationAddress: destinationAddress,
    environment: Environment.DEVNET,
    sourceAddress: destinationAddress
  };

  const transfer = await createEvmFungibleAssetTransfer(params);
  const fee = await transfer.getFee();
  console.log(fee);
  console.log(transfer.resource);
  console.log(transfer.source);
  console.log(transfer.destination);

  // const approvals = await transfer.getApprovalTransactions();
  // console.log(`Approving Tokens (${approvals.length})...`);
  // for (const approval of approvals) {
  //   const response = await wallet.sendTransaction(approval);
  //   await response.wait();
  //   console.log("approval tx: ", response.hash);
  // }

  // try {
  //   const transferTx = await transfer.getTransferTransaction();
  //   const response = await wallet.sendTransaction(transferTx);
  //   console.log("Transfer tx: ", response.hash);
  //   await response.wait();
  // } catch (error) {
  //   console.log('Error during tx: ', error);
  // }

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
