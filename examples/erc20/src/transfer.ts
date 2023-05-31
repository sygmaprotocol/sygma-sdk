import {
  EVMAssetTransfer,
  Environment,
  Fungible,
  Transfer,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers } from "ethers";

export const GOERLI_CHAIN_ID = 5;
export const SEPOLIA_CHAIN_ID = 11155111;
export const ERC20_TOKEN_SYMBOL = "ERC20LRTest";

export async function erc20Transfer(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://rpc.goerli.eth.gateway.fm/"
  );
  const wallet = new Wallet(
    "9574830b950b9ce5b66836e77ea18739258682ca08d4e65ca26b03dfe3742cf9",
    provider
  );
  const assetTransfer = new EVMAssetTransfer();
  await assetTransfer.init(provider, Environment.TESTNET);

  const domains = assetTransfer.config.getDomains();
  const resources = assetTransfer.config.getDomainResources();
  const erc20Resource = resources.find(
    (resource) => resource.symbol == ERC20_TOKEN_SYMBOL
  );
  if (!erc20Resource) {
    throw new Error("Resource not found");
  }
  const goerli = domains.find((domain) => domain.chainId == GOERLI_CHAIN_ID);
  if (!goerli) {
    throw new Error("Network goerli not supported");
  }
  const sepolia = domains.find((domain) => domain.chainId == SEPOLIA_CHAIN_ID);
  if (!sepolia) {
    throw new Error("Network sepolia not supported");
  }
  const transfer: Transfer<Fungible> = {
    sender: await wallet.getAddress(),
    amount: {
      // amount in wei
      amount: "50",
    },
    from: goerli,
    to: sepolia,
    resource: erc20Resource,
    recipient: await wallet.getAddress(),
  };

  const fee = await assetTransfer.getFee(transfer);
  const approvals = await assetTransfer.buildApprovals(transfer, fee);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(
      approval as providers.TransactionRequest
    );
    console.log("Sent approval with hash: " + response.hash);
  }
  const transferTx = await assetTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest
  );
  console.log("Sent transfer with hash: " + response.hash);
}

erc20Transfer().finally(() => { });
