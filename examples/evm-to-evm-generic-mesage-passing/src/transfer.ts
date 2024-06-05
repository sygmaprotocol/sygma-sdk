import dotenv from "dotenv";
import {
  EVMGenericMessageTransfer,
  Environment,
  TransferStatusResponse,
  getTransferStatusData,
} from "@buildwithsygma/sygma-sdk-core";
import { BigNumber, Wallet, providers, utils } from "ethers";
import { Storage__factory } from "./Contracts";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const getStatus = async (
  txHash: string
): Promise<TransferStatusResponse[]> => {
  const data = await getTransferStatusData(Environment.TESTNET, txHash);
  return data as TransferStatusResponse[];
};

const DESTINATION_CHAIN_ID = 338; // Cronos
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000500"; // Generic Message Handler
const EXECUTE_CONTRACT_ADDRESS = "0xcb9eb2b2abbd51945a82f77e789c26720b3835bf";
const EXECUTE_FUNCTION_SIGNATURE = "0xa271ced2";
const MAX_FEE = "6000000";
const CRONOS_RPC_URL = process.env.CRONOS_RPC_URL || "https://evm-t3.cronos.org";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://gateway.tenderly.co/public/sepolia";

const sourceProvider = new providers.JsonRpcProvider(SEPOLIA_RPC_URL);
const destinationProvider = new providers.JsonRpcProvider(CRONOS_RPC_URL);
const storageContract = Storage__factory.connect(
  EXECUTE_CONTRACT_ADDRESS,
  destinationProvider
);
const wallet = new Wallet(privateKey ?? "", sourceProvider);

const fetchAfterValue = async (): Promise<BigNumber> =>
  await storageContract.retrieve(await wallet.getAddress());

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

const waitUntilBridged = async (
  valueBefore: BigNumber,
  intervalDuration: number = 15000,
  attempts: number = 8
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
      console.log("Transaction is taking too much time to bridge!");
      break;
    }
  }
};

export async function genericMessage(): Promise<void> {
  const contractValueBefore = await storageContract.retrieve(
    await wallet.getAddress()
  );
  console.log(`Value before update: ${contractValueBefore.toString()}`);
  const messageTransfer = new EVMGenericMessageTransfer();
  await messageTransfer.init(sourceProvider, Environment.TESTNET);

  const EXECUTION_DATA = utils.defaultAbiCoder.encode(
    ["address", "uint256"],
    [await wallet.getAddress(), Date.now()]
  );

  const transfer = messageTransfer.createGenericMessageTransfer(
    await wallet.getAddress(),
    DESTINATION_CHAIN_ID,
    RESOURCE_ID,
    EXECUTE_CONTRACT_ADDRESS,
    EXECUTE_FUNCTION_SIGNATURE,
    EXECUTION_DATA,
    MAX_FEE
  );

  const fee = await messageTransfer.getFee(transfer);
  const transferTx = await messageTransfer.buildTransferTransaction(
    transfer,
    fee
  );

  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest
  );
  console.log("Sent transfer with hash: ", response.hash);

  console.log("Waiting for relayers to bridge transaction...");

  await waitUntilBridged(contractValueBefore);

  const id = setInterval(() => {
    getStatus(response.hash)
      .then((data) => {
        if (data[0]) {
          console.log("Status of the transfer", data[0].status);
          if(data[0].status == "executed") {
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
