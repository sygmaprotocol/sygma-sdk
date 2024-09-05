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
const BITCOIN_DOMAIN_CAIPID = "bip122:000000000933ea01ad0ee984209779ba";
const RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000700";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia-public.unifra.io"
const BTC_DESTINATION_ADDRESS = process.env.BTC_DESTINATION_ADDRESS;

const explorerUrls: Record<number, string> = { [SEPOLIA_CHAIN_ID]: 'https://sepolia.etherscan.io' };
const getTxExplorerUrl = (params: { txHash: string; chainId: number }): string => `${explorerUrls[params.chainId]}/tx/${params.txHash}`;

export async function erc20Transfer(): Promise<void> {
  const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
  const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
  const wallet = new Wallet(privateKey!, ethersWeb3Provider);

  const params = {
    source: SEPOLIA_CHAIN_ID,
    destination: BITCOIN_DOMAIN_CAIPID,
    sourceNetworkProvider: web3Provider,
    resource: RESOURCE_ID,
    amount: BigInt(1) * BigInt(1e8), // or any amount to send
    destinationAddress: BTC_DESTINATION_ADDRESS,
    sourceAddress: await wallet.getAddress(),
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
  console.log(`Deposited, transaction:  ${getTxExplorerUrl({ txHash: response.hash, chainId: SEPOLIA_CHAIN_ID })}`);
}

erc20Transfer().finally(() => { });