import dotenv from "dotenv";
import {
  EVMGenericMessageTransfer,
  Environment,
  EvmFee,
  FeeHandlerType,
} from "@buildwithsygma/sygma-sdk-core";
import { BigNumber, Wallet, providers, utils } from "ethers";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const DESTINATION_CHAIN_ID = 17000;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000500"; // Generic Message Handler
const EXECUTE_CONTRACT_ADDRESS = "0xdFA5621F95675D37248bAc9e536Aab4D86766663";
const EXECUTE_FUNCTION_SIGNATURE = "0xa271ced2";
const MAX_FEE = "999999";

export async function genericMessage(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://gateway.tenderly.co/public/sepolia"
  );
  // @ts-ignore
  const wallet = new Wallet(privateKey, provider);
  const messageTransfer = new EVMGenericMessageTransfer();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await messageTransfer.init(provider, Environment.TESTNET_X);

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

  const fee: EvmFee = {
    fee: BigNumber.from("0"),
    feeData: "",
    type: FeeHandlerType.BASIC,
    handlerAddress: "0x",
  };
  const transferTx = await messageTransfer.buildTransferTransaction(
    transfer,
    fee
  );

  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest
  );
  console.log("Sent transfer with hash: ", response.hash);
}

genericMessage().finally(() => {});
