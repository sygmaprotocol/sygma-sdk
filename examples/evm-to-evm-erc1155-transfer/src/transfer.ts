import { Eip1193Provider, getSygmaScanLink } from "@buildwithsygma/core";
import {
  createSemiFungibleAssetTransfer,
  SemiFungibleTransferParams,
} from "@buildwithsygma/evm";
import dotenv from "dotenv";
import { Wallet, providers } from "ethers";
import Web3HttpProvider from "web3-providers-http";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY ?? "";

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const SEPOLIA_CHAIN_ID = 11155111;
const CRONOS_TESTNET_CHAIN_ID = 338;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000300";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";

const explorerUrls: Record<number, string> = {
  [SEPOLIA_CHAIN_ID]: "https://sepolia.etherscan.io",
};
const getTxExplorerUrl = (params: {
  txHash: string;
  chainId: number;
}): string => `${explorerUrls[params.chainId]}/tx/${params.txHash}`;

export async function erc1155Transfer(): Promise<void> {
  const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
  const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
  const wallet = new Wallet(privateKey, ethersWeb3Provider);
  const sourceAddress = await wallet.getAddress();
  const destinationAddress = await wallet.getAddress(); // Replace with the actual recipient address

  const params: SemiFungibleTransferParams = {
    source: SEPOLIA_CHAIN_ID,
    destination: CRONOS_TESTNET_CHAIN_ID,
    sourceNetworkProvider: web3Provider as unknown as Eip1193Provider,
    resource: RESOURCE_ID,
    tokenIds: [process.env.TOKEN_ID], // Ensure TOKEN_ID of NFT is set in your .env file
    amounts: [BigInt(process.env.AMOUNT)], // Amount is always 1 for non-fungible tokens
    recipientAddress: destinationAddress,
    sourceAddress,
  };

  const transfer = await createSemiFungibleAssetTransfer(params);
  const approvals = await transfer.getApprovalTransactions();

  console.log(`Approving Tokens (${approvals.length})...`);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(approval);
    await response.wait();
    console.log(
      `Approved, transaction: ${getTxExplorerUrl({
        txHash: response.hash,
        chainId: SEPOLIA_CHAIN_ID,
      })}`
    );
  }

  const transferTx = await transfer.getTransferTransaction();
  const response = await wallet.sendTransaction(transferTx);
  await response.wait();
  console.log(
    `Deposited, transaction: ${getSygmaScanLink(
      response.hash,
      process.env.SYGMA_ENV
    )}`
  );
}

erc1155Transfer().catch((error) => {
  console.error("Error during ERC1155 transfer:", error);
});
