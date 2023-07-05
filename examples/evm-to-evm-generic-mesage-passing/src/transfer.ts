import {
  EVMGenericMessageTransfer,
  Environment,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers } from "ethers";

const SEPOLIA_CHAIN_ID = 11155111;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000500"; // Generic Message Handler
const EXECUTE_CONTRACT_ADDRESS = "0xdd0053CeDF84637d7Db258d05DcFA59206cB105D";
const EXECUTE_FUNCTION_SIGNATURE = "";
const EXECUTION_DATA = "";
const MAX_FEE = "";

export async function genericMessage(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://rpc.goerli.eth.gateway.fm/"
  );
  const wallet = new Wallet(
    "9574830b950b9ce5b66836e77ea18739258682ca08d4e65ca26b03dfe3742cf9",
    provider
  );
  const messageTransfer = new EVMGenericMessageTransfer();
  await messageTransfer.init(provider, Environment.TESTNET);

  const transfer = messageTransfer.createGenericMessageTransfer(
    await wallet.getAddress(),
    SEPOLIA_CHAIN_ID,
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
}

erc20Transfer().finally(() => { });
