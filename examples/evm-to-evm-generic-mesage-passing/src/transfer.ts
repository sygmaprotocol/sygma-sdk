import {
  EVMGenericMessageTransfer,
  Environment,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers, utils } from "ethers";

const DESTINATION_CHAIN_ID = 5;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000500"; // Generic Message Handler
const EXECUTE_CONTRACT_ADDRESS = "0x94CF8543b705dAB2DA5d2D58C240ECB1e5974781";
const EXECUTE_FUNCTION_SIGNATURE = "0x131a0680";
const MAX_FEE = "300000";

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export async function genericMessage(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://gateway.tenderly.co/public/sepolia"
  );
  const wallet = new Wallet(
    "9574830b950b9ce5b66836e77ea18739258682ca08d4e65ca26b03dfe3742cf9",
    provider
  );
  const messageTransfer = new EVMGenericMessageTransfer();
  await messageTransfer.init(provider, Environment.TESTNET);

  const EXECUTION_DATA = utils.solidityPack(
    ["string"],
    [`Updated value ${Date.now()}`]
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

  console.log("sleeping");
  await sleep(2000);
  console.log("finished sleeping");
  const fee = await messageTransfer.getFee(transfer);
  const transferTx = await messageTransfer.buildTransferTransaction(
    transfer,
    fee
  );

  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest
  );
  console.log("Sent transfer with hash: ", response.hash);
}

genericMessage().finally(() => { });
