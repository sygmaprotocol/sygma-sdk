import dotenv from "dotenv";
import type { TransferStatusResponse } from "@buildwithsygma/sygma-sdk-core";
import {
  EVMGenericMessageTransfer,
  Environment,
  getTransferStatusData,
} from "@buildwithsygma/sygma-sdk-core";
import { BigNumber, Wallet, providers, utils } from "ethers";
import { Storage__factory } from "./Contracts/index.js";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const getStatus = async (txHash: string): Promise<TransferStatusResponse[]> => {
  const data = await getTransferStatusData(Environment.TESTNET, txHash);
  return data;
};

const DESTINATION_CHAIN_ID = 17000; // holesky
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000500"; // Generic Message Handler
const EXECUTE_CONTRACT_ADDRESS = "0xfE9f1b633C93f0BC8783DB42dec8B22e26Bc8925";
const EXECUTE_FUNCTION_SIGNATURE = "0x0a79309b";
const MAX_FEE = "3000000";
const HOLESKY_SEPOLIA_RPC_URL =
  process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://gateway.tenderly.co/public/sepolia";

const sourceProvider = new providers.JsonRpcProvider(SEPOLIA_RPC_URL);
const destinationProvider = new providers.JsonRpcProvider(
  HOLESKY_SEPOLIA_RPC_URL,
);
const storageContract = Storage__factory.connect(
  EXECUTE_CONTRACT_ADDRESS,
  destinationProvider,
);
const wallet = new Wallet(privateKey ?? "", sourceProvider);

const fetchAfterValue = async (): Promise<BigNumber> =>
  await storageContract.retrieve(await wallet.getAddress());

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

const waitUntilBridged = async (
  valueBefore: BigNumber,
  intervalDuration: number = 15000,
  attempts: number = 8,
): Promise<void> => {
  let i = 0;
  let contractValueAfter: BigNumber;
  for (;;) {
    await sleep(intervalDuration);
    contractValueAfter = await fetchAfterValue();
    if (!contractValueAfter.eq(valueBefore)) {
      console.log("Transaction successfully bridged.");
      console.log(`Value after update: ${contractValueAfter.toString()}`);
      break;
    }
    i++;
    if (i > attempts) {
      // transaction should have been bridged already
      console.log("transaction is taking too much time to bridge!");
      break;
    }
  }
};

export async function genericMessage(): Promise<void> {
  const adr = await wallet.getAddress();
  console.log(`Address: ${adr}`);
  // const contractValueBefore = await storageContract.retrieve(
  //   adr,
  // );
  // console.log(`Value before update: ${contractValueBefore.toString()}`);
  const messageTransfer = new EVMGenericMessageTransfer();
  await messageTransfer.init(sourceProvider, Environment.TESTNET);

  const EXECUTION_DATA = utils.defaultAbiCoder.encode(["uint256"], [77]);

  const transfer = messageTransfer.createGenericMessageTransfer(
    await wallet.getAddress(),
    DESTINATION_CHAIN_ID,
    RESOURCE_ID,
    EXECUTE_CONTRACT_ADDRESS,
    EXECUTE_FUNCTION_SIGNATURE,
    EXECUTION_DATA,
    MAX_FEE,
  );

  const fee = await messageTransfer.getFee(transfer);
  const transferTx = await messageTransfer.buildTransferTransaction(
    transfer,
    fee,
  );

  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest,
  );
  console.log("Sent transfer with hash: ", response.hash);

  console.log("Waiting for relayers to bridge transaction...");

  await waitUntilBridged(BigNumber.from(1));

  const id = setInterval(() => {
    getStatus(response.hash)
      .then((data) => {
        if (data[0]) {
          console.log("Status of the transfer", data[0].status);
          if (data[0].status == "executed") {
            clearInterval(id);
            process.exit(0);
          }
        } else {
          console.log("Waiting for the TX to be indexed");
        }
      })
      .catch((e) => {
        console.log("error:", e);
      });
  }, 5000);
}

genericMessage().finally(() => {});
