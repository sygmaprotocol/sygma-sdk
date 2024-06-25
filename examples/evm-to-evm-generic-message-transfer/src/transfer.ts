import dotenv from "dotenv";
import { createCrossChainContractCall } from '@buildwithsygma/evm';
import { Wallet, ethers, providers } from "ethers";
import { storageAbi } from './contracts';
import { Eip1193Provider } from "@buildwithsygma/core";
import Web3HttpProvider from "web3-providers-http";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const DESTINATION_CHAIN_ID = 17000;
const SEPOLIA_CHAIN_ID = 11155111;
const RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000500";
const EXECUTE_CONTRACT_ADDRESS = "0x669f52487ffa6f9abf722082f735537a98ec0e4b";
const MAX_FEE = "3000000";
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://gateway.tenderly.co/public/sepolia"

const sourceProvider = new Web3HttpProvider(SEPOLIA_RPC_URL);
const wallet = new Wallet(privateKey ?? "");
const destinationProvider = new providers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);

export async function genericMessage(): Promise<void> {
    const walletAddress = await wallet.getAddress();
    const destinationStorageContract = new ethers.Contract(EXECUTE_CONTRACT_ADDRESS, storageAbi, destinationProvider);
    const valueBeforeBridging = await destinationStorageContract.callStatic.retrieve(walletAddress);
    console.log(`Value before update: ${valueBeforeBridging}`);

    const transfer = await createCrossChainContractCall<typeof storageAbi, 'store'>({
      gasLimit: BigInt(0),
      functionParameters: [walletAddress as `0x${string}`, BigInt(0)],
      functionName: 'store',
      destinationContractAbi: storageAbi,
      destinationContractAddress: EXECUTE_CONTRACT_ADDRESS,
      maxFee: BigInt(MAX_FEE),
      source: SEPOLIA_CHAIN_ID,
      destination: DESTINATION_CHAIN_ID,
      sourceNetworkProvider: sourceProvider as unknown as Eip1193Provider,
      sourceAddress: walletAddress,
      resource: RESOURCE_ID
    });

    const transaction = await transfer.buildTransaction();
    console.log(transaction);
}

genericMessage().finally(() => {});