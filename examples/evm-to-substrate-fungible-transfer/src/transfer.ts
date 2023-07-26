import { EVMAssetTransfer } from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const PHALA_CHAIN_ID = 5233;
const DESTINATION_ADDRESS = "5F9ieYGtprgak4BBgBeBm7E1rrp45BsoimAFBcX15f7Szs77";
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

export async function erc20Transfer(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/d6a17d5f758c4725add01ff97522e0c1"
  );
  const wallet = new Wallet(privateKey, provider);
  const assetTransfer = new EVMAssetTransfer();
  await assetTransfer.init(provider);

  const transfer = assetTransfer.createFungibleTransfer(
    await wallet.getAddress(),
    PHALA_CHAIN_ID,
    DESTINATION_ADDRESS,
    RESOURCE_ID,
    "5000000000000000000" // 18 decimal places
  );

  const fee = await assetTransfer.getFee(transfer);
  const approvals = await assetTransfer.buildApprovals(transfer, fee);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(
      approval as providers.TransactionRequest
    );
    console.log("Sent approval with hash: ", response.hash);
  }
  const transferTx = await assetTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest
  );
  console.log("Sent transfer with hash: ", response.hash);
}

erc20Transfer().finally(() => {});
