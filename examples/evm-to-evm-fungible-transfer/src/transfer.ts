import { Eip1193Provider, Environment } from "@buildwithsygma/core";
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
const RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000200";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia-public.unifra.io"

const explorerUrls: Record<number, string> = { [SEPOLIA_CHAIN_ID]: 'https://sepolia.etherscan.io' };
const getTxExplorerUrl = (params: { txHash: string; chainId: number }): string => `${explorerUrls[params.chainId]}/tx/${params.txHash}`;

export async function erc20Transfer(): Promise<void> {
  const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
  const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
  const wallet = new Wallet(privateKey ?? "", ethersWeb3Provider);
  const destinationAddress = await wallet.getAddress();

  const params = {
    source: SEPOLIA_CHAIN_ID,
    destination: HOLESKY_CHAIN_ID,
    sourceNetworkProvider: web3Provider as unknown as Eip1193Provider,
    resource: RESOURCE_ID,
    amount: BigInt(2) * BigInt(1e18),
    destinationAddress: destinationAddress,
    environment: Environment.DEVNET,
    sourceAddress: destinationAddress,
  };

  const transfer = await createEvmFungibleAssetTransfer(params);

  const approvals = await transfer.getApprovalTransactions();
  console.log(`Approving Tokens (${approvals.length})...`);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(approval);
    await response.wait();
    console.log(`Approved, transaction: ${getTxExplorerUrl({ txHash: response.hash, chainId: SEPOLIA_CHAIN_ID })}`);
  }

  const transferTx = await transfer.getTransferTransaction();
  const response = await wallet.sendTransaction(transferTx);
  await response.wait();
  console.log(`Depositted, transaction:  ${getTxExplorerUrl({ txHash: response.hash, chainId: SEPOLIA_CHAIN_ID })}`);
}

erc20Transfer().finally(() => {});
