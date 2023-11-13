import dotenv from "dotenv";
import {
  EVMGenericMessageTransfer,
  Environment,
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
): Promise<{ status: string; explorerUrl: string } | void> => {
  try {
    const data = await getTransferStatusData(Environment.TESTNET, txHash);

    return data as { status: string; explorerUrl: string };
  } catch (e) {
    console.log("error: ", e);
  }
};

const DESTINATION_CHAIN_ID = 5; // Goerli
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000500"; // Generic Message Handler
const EXECUTE_CONTRACT_ADDRESS = "0xdFA5621F95675D37248bAc9e536Aab4D86766663";
const EXECUTE_FUNCTION_SIGNATURE = "0xa271ced2";
const MAX_FEE = "3000000";
const sourceProvider = new providers.JsonRpcProvider(
  "https://gateway.tenderly.co/public/sepolia"
);
const destinationProvider = new providers.JsonRpcProvider(
  "https://rpc.goerli.eth.gateway.fm/"
);
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
      console.log(
        `Value after update: ${new Date(
          contractValueAfter.toNumber()
        ).toString()}`
      );
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
  const contractValueBefore = await storageContract.retrieve(
    await wallet.getAddress()
  );
  console.log(
    `Value before update: ${new Date(
      contractValueBefore.toNumber()
    ).toString()}`
  );
  const messageTransfer = new EVMGenericMessageTransfer();
  await messageTransfer.init(sourceProvider, Environment.TESTNET);

  const EXECUTION_DATA = utils.defaultAbiCoder.encode(["uint"], [Date.now()]);

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

  let dataResponse: undefined | { status: string; explorerUrl: string };

  const id = setInterval(() => {
    getStatus(response.hash)
      .then((data) => {
        if (data) {
          dataResponse = data;
          console.log("Status of the transfer", data.status);
        }
      })
      .catch(() => {
        console.log("Transfer still not indexed, retrying...");
      });

    if (dataResponse && dataResponse.status === "executed") {
      console.log("Transfer executed successfully");
      clearInterval(id);
      process.exit(0);
    }
  }, 5000);
}

genericMessage().finally(() => {});
