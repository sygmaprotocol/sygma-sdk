import {
  EVMAssetTransfer,
  Environment,
  Fungible,
  Transfer, SubstrateAssetTransfer, SubstrateParachain,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers } from "ethers";
import {Keyring} from "@polkadot/keyring";
import {cryptoWaitReady} from "@polkadot/util-crypto";
import {ApiPromise, WsProvider} from "@polkadot/api";

const ERC20_TOKEN_SYMBOL = "ERC20LRTest";
const SUBSTRATE_DESTINATION_ADDRESS = "5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt";
const EVM_DESTINATION_ADDRESS = "0xD31E89feccCf6f2DE10EaC92ADffF48D802b695C";
const RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000000300";

const EVM1_CHAIN_ID = 1337;
const EVM2_CHAIN_ID = 1338;
const SUBSTRATE_CHAIN_ID = 5;

const EVM1_RPC_URL = "http://127.0.0.1:8545"
const EVM2_RPC_URL = "http://127.0.0.1:8547"
const SUBSTRATE_RPC_URL = "ws://127.0.0.1:9944"

const ALICE_MNEMONIC =
    "bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice";

export async function fungibleTransferFromEVM(): Promise<void> {
  const provider = new providers.JsonRpcProvider(
    EVM1_RPC_URL
  );
  const wallet = new Wallet(
    "cc2c32b154490f09f70c1c8d4b997238448d649e0777495863db231c4ced3616",
    provider
  );

  const assetTransfer = new EVMAssetTransfer();
  await assetTransfer.init(provider, Environment.LOCAL);

  const domains = assetTransfer.config.getDomains();
  const resources = assetTransfer.config.getDomainResources();

  const erc20Resource = resources.find(
    (resource) => resource.symbol == ERC20_TOKEN_SYMBOL
  );
  if (!erc20Resource) {
    throw new Error("Resource not found");
  }
  const evm1Network = domains.find((domain) => domain.chainId == EVM1_CHAIN_ID);
  if (!evm1Network) {
    throw new Error("Network evm1 not supported");
  }
  const substrateNetwork = domains.find(
    (domain) => domain.chainId == SUBSTRATE_CHAIN_ID
  );
  if (!substrateNetwork) {
    throw new Error("Network substrate not supported");
  }

  const transfer: Transfer<Fungible> = {
    sender: await wallet.getAddress(),
    amount: {
      // amount in wei
      amount: "500000000",
    },
    from: evm1Network,
    to: substrateNetwork,
    resource: erc20Resource,
    recipient: EVM_DESTINATION_ADDRESS,
  };

  const fee = await assetTransfer.getFee(transfer);
  const approvals = await assetTransfer.buildApprovals(transfer, fee);
  for (const approval of approvals) {
    const response = await wallet.sendTransaction(
      approval as providers.TransactionRequest
    );
    console.log("Sent approval with hash: " + response.hash);
  }
  const transferTx = await assetTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  const response = await wallet.sendTransaction(
    transferTx as providers.TransactionRequest
  );
  console.log("Sent transfer with hash: " + response.hash);
}

export async function fungibleTransferFromSubstrate(): Promise<void> {
  const keyring = new Keyring({ type: "sr25519" });
  // Make sure to fund this account with native tokens
  // Account address: 5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS

  await cryptoWaitReady();

  const account = keyring.addFromUri(ALICE_MNEMONIC);

  const wsProvider = new WsProvider(
      SUBSTRATE_RPC_URL
  );
  const api = await ApiPromise.create({ provider: wsProvider });

  const assetTransfer = new SubstrateAssetTransfer();
  await assetTransfer.init(
      api,
      SubstrateParachain.LOCAL,
      Environment.LOCAL
  );

  const domains = assetTransfer.config.getDomains();
  const resources = assetTransfer.config.getDomainResources();
  console.log(resources)
  const erc20Resource = resources.find(
      (resource) => resource.resourceId == RESOURCE_ID
  );
  if (!erc20Resource) {
    throw new Error("Resource not found");
  }
  const evm1Network = domains.find((domain) => domain.chainId == SUBSTRATE_CHAIN_ID);
  if (!evm1Network) {
    throw new Error("Network goerli not supported");
  }
  const substrateNetwork = domains.find(
      (domain) => domain.chainId == EVM1_CHAIN_ID
  );
  if (!substrateNetwork) {
    throw new Error("Network sepolia not supported");
  }

  const transfer: Transfer<Fungible> = {
    sender: account.address,
    amount: {
      // amount in wei
      amount: "500000000",
    },
    from: evm1Network,
    to: substrateNetwork,
    resource: erc20Resource,
    recipient: EVM_DESTINATION_ADDRESS,
  };

  const fee = await assetTransfer.getFee(transfer);

  const transferTx = assetTransfer.buildTransferTransaction(transfer, fee);

  const unsub = await transferTx.signAndSend(account, ({ status }) => {
    console.log(`Current status is ${status.toString()}`);

    if (status.isInBlock) {
      console.log(
          `Transaction included at blockHash ${status.asInBlock.toString()}`
      );
    } else if (status.isFinalized) {
      console.log(
          `Transaction finalized at blockHash ${status.asFinalized.toString()}`
      );
      unsub();
    }
  });
}

// start specific example based on process arg
switch (process.argv[2]) {
  case "1":
    fungibleTransferFromEVM().finally(() => { });
    break;
  case "2":
    fungibleTransferFromSubstrate().finally(() => {});
    break;
  default:
    console.log("example not supported")
}

