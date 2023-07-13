import {
  EVMGenericMessageTransfer,
  Environment,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers, utils } from "ethers";

const DESTINATION_CHAIN_ID = 5; // Goerli
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000500"; // Generic Message Handler
const EXECUTE_CONTRACT_ADDRESS = "0x25ecabb6b4e11a2f3b6c1d41c201954355657059";
const EXECUTE_FUNCTION_SIGNATURE = "0x845c03c1";
const MAX_FEE = "3000000";

export async function genericMessage(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://gateway.tenderly.co/public/sepolia"
  );
  const wallet = new Wallet(
    "9574830b950b9ce5b66836e77ea18739258682ca08d4e65ca26b03dfe3742cf9",
    provider
  );
  const messageTransfer = new EVMGenericMessageTransfer();
  await messageTransfer.init(provider, Environment.DEVNET);

  const EXECUTION_DATA = utils.defaultAbiCoder.encode(
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
