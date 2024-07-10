import dotenv from "dotenv";
import { createCrossChainContractCall } from "@buildwithsygma/evm";
import { Wallet, ethers, providers } from "ethers";
import { sepoliaBase0x4bE595ab5A070663B314970Fc10C049BBA0ad489 } from "./contracts";
import { Eip1193Provider } from "@buildwithsygma/core";
import Web3HttpProvider from "web3-providers-http";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const DESTINATION_CHAIN_ID = 84532;
const SEPOLIA_CHAIN_ID = 11155111;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000600";
const EXECUTE_CONTRACT_ADDRESS = "0x4bE595ab5A070663B314970Fc10C049BBA0ad489";
const MAX_FEE = "3000000";
const BASE_SEPOLIA_RPC_URL =
  process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://gateway.tenderly.co/public/sepolia";

const sourceProvider = new Web3HttpProvider(SEPOLIA_RPC_URL);
const ethersProvider = new ethers.providers.Web3Provider(sourceProvider);
const wallet = new Wallet(privateKey ?? "", ethersProvider);
const destinationProvider = new providers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);

export async function genericMessage(): Promise<void> {
  const walletAddress = await wallet.getAddress();
  const destinationStorageContract = new ethers.Contract(
    EXECUTE_CONTRACT_ADDRESS,
    sepoliaBase0x4bE595ab5A070663B314970Fc10C049BBA0ad489,
    destinationProvider
  );
  const valueBeforeBridging =
    await destinationStorageContract.callStatic.retrieve(walletAddress);
  console.log(`Value before update: ${valueBeforeBridging}`);

  const transfer = await createCrossChainContractCall<
    typeof sepoliaBase0x4bE595ab5A070663B314970Fc10C049BBA0ad489,
    "store"
  >({
    gasLimit: BigInt(0),
    functionParameters: [
      "0x98729c03c4D5e820F5e8c45558ae07aE63F97461" as `0x${string}`,
      BigInt(0x100) as any,
      // the bridge executor add first parameter by
      // itself so I had to type this as any
      // TODO: find a workaround and keep strict typing
    ] as any,
    functionName: "store",
    destinationContractAbi:
      sepoliaBase0x4bE595ab5A070663B314970Fc10C049BBA0ad489,
    destinationContractAddress: EXECUTE_CONTRACT_ADDRESS,
    maxFee: BigInt(MAX_FEE),
    source: SEPOLIA_CHAIN_ID,
    destination: DESTINATION_CHAIN_ID,
    sourceNetworkProvider: sourceProvider as unknown as Eip1193Provider,
    sourceAddress: walletAddress,
    resource: RESOURCE_ID,
  });

  const transaction = await transfer.buildTransaction();
  const tx = await wallet.sendTransaction(transaction);
  console.log("Sent transaction: ", tx.hash);

  await tx.wait();
  console.log("Transaction Processed: ", tx.hash);
}

genericMessage()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
