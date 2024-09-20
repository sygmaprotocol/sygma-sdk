import {
  Config,
  EvmResource,
  getSygmaScanLink,
  type Eip1193Provider,
} from "@buildwithsygma/core";
import {
  createFungibleAssetTransfer,
  FungibleTransferParams,
} from "@buildwithsygma/evm";
import dotenv from "dotenv";
import { Wallet, ethers, providers } from "ethers";
import Web3HttpProvider from "web3-providers-http";
import { getContractAddress, getContractInterface } from "./contracts";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const SEPOLIA_CHAIN_ID = 11155111;
const BASE_SEPOLIA_CHAIN_ID = 84532;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001200";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const explorerUrls: Record<number, string> = {
  [SEPOLIA_CHAIN_ID]: "https://sepolia.etherscan.io",
};
const getTxExplorerUrl = (params: {
  txHash: string;
  chainId: number;
}): string => `${explorerUrls[params.chainId]}/tx/${params.txHash}`;

export async function erc20Transfer(): Promise<void> {
  const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
  const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
  const wallet = new Wallet(privateKey ?? "", ethersWeb3Provider);
  const sourceAddress = await wallet.getAddress();
  const destinationAddress = await wallet.getAddress();
  const contract = "sprinterNameService";

  const config = new Config();
  await config.init(process.env.SYGMA_ENV);
  const resource = config
    .getResources(BASE_SEPOLIA_CHAIN_ID)
    .find((resource) => resource.resourceId === RESOURCE_ID);

  if (!resource) return;

  const targetContractAddress = getContractAddress(
    BASE_SEPOLIA_CHAIN_ID,
    contract
  );

  const contractInterface = getContractInterface(contract);

  const params: FungibleTransferParams = {
    source: SEPOLIA_CHAIN_ID,
    destination: BASE_SEPOLIA_CHAIN_ID,
    sourceNetworkProvider: web3Provider as unknown as Eip1193Provider,
    resource: RESOURCE_ID,
    amount: BigInt(1) * BigInt(1e6),
    recipientAddress: ethers.constants.AddressZero,
    sourceAddress: sourceAddress,
    optionalGas: BigInt(5_000_000),
    optionalMessage: {
      receiver: destinationAddress,
      transactionId: ethers.utils.formatBytes32String("EVM-ERC20+GENERIC"),
      actions: [
        {
          approveTo: targetContractAddress,
          tokenSend: (resource as EvmResource).address,
          tokenReceive: ethers.constants.AddressZero,
          nativeValue: BigInt(0),
          callTo: targetContractAddress,
          data: contractInterface.encodeFunctionData("claimName", [
            "EVM-ERC20+GENERIC",
            destinationAddress,
            BigInt(5) * BigInt(1e5),
          ]),
        },
      ],
    },
  };

  const transfer = await createFungibleAssetTransfer(params);

  const approvals = await transfer.getApprovalTransactions();
  console.log(`Approving Tokens (${approvals.length})...`);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(approval);
    await response.wait();
    console.log(
      `Approved, transaction: ${getTxExplorerUrl({ txHash: response.hash, chainId: SEPOLIA_CHAIN_ID })}`
    );
  }

  const transferTx = await transfer.getTransferTransaction();
  const response = await wallet.sendTransaction(transferTx);
  await response.wait();
  console.log(
    `Depositted, transaction:  ${getSygmaScanLink(response.hash, process.env.SYGMA_ENV)}`
  );
}

erc20Transfer().finally(() => {});
