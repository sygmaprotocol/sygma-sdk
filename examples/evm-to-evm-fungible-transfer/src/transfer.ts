import {
  EVMAssetTransfer,
  Environment,
  EvmFee,
  FeeHandlerType,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers, BigNumber, PopulatedTransaction } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const HOLESKY_CHAIN_ID = 17000;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000300";

export async function erc20Transfer(): Promise<void> {
  const provider = new providers.JsonRpcProvider("https://rpc2.sepolia.org	");
  // @ts-ignore
  const wallet = new Wallet(privateKey, provider);
  const assetTransfer = new EVMAssetTransfer();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await assetTransfer.init(provider, Environment.TESTNET_X);

  const transfer = assetTransfer.createFungibleTransfer(
    await wallet.getAddress(),
    HOLESKY_CHAIN_ID,
    await wallet.getAddress(), // Sending to the same address on a different chain
    RESOURCE_ID,
    "5000000000000000" // 18 decimal places
  );
  const fee: EvmFee = {
    fee: BigNumber.from("0"),
    feeData: "",
    type: FeeHandlerType.BASIC,
    handlerAddress: "0x",
  };
  const approvals = await assetTransfer.buildApprovals(transfer, fee);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(
      approval as PopulatedTransaction
    );
    console.log("Sent approval with hash: ", response.hash);
  }
  const transferTx = await assetTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  const response = await wallet.sendTransaction(transferTx);
  console.log("Sent transfer with hash: ", response.hash);
}

erc20Transfer().finally(() => {});
