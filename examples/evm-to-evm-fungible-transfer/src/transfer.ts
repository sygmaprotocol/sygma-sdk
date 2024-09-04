import type { Eip1193Provider } from "@buildwithsygma/core";
import {
  createEvmFungibleAssetTransfer,
  EvmFungibleTransferRequest,
} from "@buildwithsygma/evm";
import dotenv from "dotenv";
import { Wallet, ethers, providers } from "ethers";
import Web3HttpProvider from "web3-providers-http";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const SEPOLIA_CHAIN_ID = 11155111;
const AMOY_CHAIN_ID = 84532;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001200";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/MeCKDrpxLkGOn4LMlBa3cKy1EzzOzwzG";

const paramAddress = "0x98729c03c4D5e820F5e8c45558ae07aE63F97461" as const;

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

  const contractInterface = new ethers.utils.Interface(
    '[{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"Sender","type":"address"},{"indexed":false,"internalType":"string","name":"Name","type":"string"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"_destination","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"burglarize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"address","name":"_from","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"claimName","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenSent","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"handleAcrossMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenSent","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"","type":"address"},{"internalType":"bytes","name":"_message","type":"bytes"}],"name":"handleV3AcrossMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"names","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
  );

  const params: EvmFungibleTransferRequest = {
    source: SEPOLIA_CHAIN_ID,
    destination: AMOY_CHAIN_ID,
    sourceNetworkProvider: web3Provider as unknown as Eip1193Provider,
    resource: RESOURCE_ID,
    amount: BigInt(1) * BigInt(1e4),
    destinationAddress: ethers.constants.AddressZero, // this needs to be AddressZero to call DefaultMessageReceiver on dest
    sourceAddress: sourceAddress,
    optionalGas: BigInt(500000),
    optionalMessage: {
      receiver: destinationAddress, // fall back for leftovers GasNativeToken based on execution
      actions: [
        {
          nativeValue: BigInt(0),
          callTo: "0x3F9A68fF29B3d86a6928C44dF171A984F6180009", //the call contract
          approveTo: "0x3F9A68fF29B3d86a6928C44dF171A984F6180009", // contract
          tokenSend: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // token address
          tokenReceive: ethers.constants.AddressZero,
          data: contractInterface.encodeFunctionData("claimName", [
            "Saad Ahmed",
            destinationAddress,
            BigInt(500000),
          ]),
        },
      ],
      transactionId: ethers.utils.formatBytes32String("Testing"),
    },
  };

  const transfer = await createEvmFungibleAssetTransfer(params);
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
    `Deposited, transaction:  ${getTxExplorerUrl({ txHash: response.hash, chainId: SEPOLIA_CHAIN_ID })}`
  );
}

erc20Transfer().finally(() => {});
