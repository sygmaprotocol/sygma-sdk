import { EVMAssetTransfer, Environment } from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers } from "ethers";

const ROCOCO_PHALA_CHAIN_ID = 5231;
const DESTINATION_ADDRESS = "5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt";
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001000";

export async function erc20Transfer(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    "https://rpc.goerli.eth.gateway.fm/"
  );
  const wallet = new Wallet(
    "9574830b950b9ce5b66836e77ea18739258682ca08d4e65ca26b03dfe3742cf9",
    provider
  );
  const assetTransfer = new EVMAssetTransfer();
  await assetTransfer.init(provider, Environment.TESTNET);


  const transfer = assetTransfer.buildFungibleTransferObject(
    await wallet.getAddress(),
    ROCOCO_PHALA_CHAIN_ID,
    DESTINATION_ADDRESS,
    RESOURCE_ID,
    500000000
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

erc20Transfer().finally(() => { });
