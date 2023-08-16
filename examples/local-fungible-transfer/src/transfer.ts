import {
  EVMAssetTransfer,
  Environment,
  Fungible,
  Transfer,
  SubstrateAssetTransfer,
  SubstrateParachain,
  SubstrateResource,
} from "@buildwithsygma/sygma-sdk-core";
import { Wallet, providers, ethers, BigNumber } from "ethers";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ERC20PresetMinterPauser__factory } from "@buildwithsygma/sygma-contracts";
import { NonceManager } from "@ethersproject/experimental";

const ERC20_TOKEN_SYMBOL = "ERC20LRTest";
const SUBSTRATE_DESTINATION_ADDRESS =
  "5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt";
const EVM_DESTINATION_ADDRESS = "0xD31E89feccCf6f2DE10EaC92ADffF48D802b695C";
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000300";
const ERC20_TOKEN_ADDRESS = "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6";

// Local setup chain IDs
const EVM1_CHAIN_ID = 1337;
const EVM2_CHAIN_ID = 1338;
const SUBSTRATE_CHAIN_ID = 5;

// Local setup RPC URLs
const EVM1_RPC_URL = "http://127.0.0.1:8545";
const EVM2_RPC_URL = "http://127.0.0.1:8547";
const SUBSTRATE_RPC_URL = "ws://127.0.0.1:9944";

const ALICE_MNEMONIC =
  "bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice";
const wsProvider = new WsProvider(SUBSTRATE_RPC_URL);

const provider = new providers.JsonRpcProvider(EVM1_RPC_URL);
const w = new Wallet(
  "cc2c32b154490f09f70c1c8d4b997238448d649e0777495863db231c4ced3616",
  provider
);
const wallet = new NonceManager(w);

export async function fungibleTransferFromEVM(): Promise<void> {
  const keyring = new Keyring({ type: "sr25519" });
  await cryptoWaitReady();
  const account = keyring.addFromUri(ALICE_MNEMONIC);

  const assetTransfer = new EVMAssetTransfer();
  await assetTransfer.init(provider, Environment.LOCAL);

  const sender = await wallet.getAddress();
  const api = await ApiPromise.create({ provider: wsProvider });

  const b = (
    await api.query.assets.account(2000, account.address)
  ).toHuman() as { balance: string };
  const destinationBalanceBefore = BigNumber.from(
    b.balance.split(",").join("")
  ).toString();

  const sourceErc20LR18Contract = ERC20PresetMinterPauser__factory.connect(
    ERC20_TOKEN_ADDRESS,
    wallet
  );

  const balanceBefore = (
    await sourceErc20LR18Contract.balanceOf(sender)
  ).toString();

  console.log(`Transferring 5 tokens from evm1 to substrate.`);
  console.log(`Sender: ${sender}`);
  console.log(`Sender token balance on evm1 network before:${balanceBefore}`);
  console.log(
    `Sender token balance on substrate network before:${destinationBalanceBefore}`
  );

  const transfer = await assetTransfer.createFungibleTransfer(
    sender,
    SUBSTRATE_CHAIN_ID,
    account.address,
    RESOURCE_ID,
    "5000000000000000000" // 18 decimal places
  );

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

  console.log("Waiting for relayers to bridge transaction...");

  let i = 0;
  let destinationBalanceAfter: BigNumber;
  for (; ;) {
    await sleep(7000);
    const d = (
      await api.query.assets.account(2000, account.address)
    ).toHuman() as { balance: string };
    destinationBalanceAfter = BigNumber.from(d.balance.split(",").join(""));
    if (!destinationBalanceAfter.eq(destinationBalanceBefore)) {
      console.log("Transaction successfully bridged.");
      break;
    }
    i++;
    if (i > 5) {
      // transaction should have been bridged already
      console.log("transaction is taking too much time to bridge!");
      break;
    }
  }

  const balanceAfter = (
    await sourceErc20LR18Contract.balanceOf(sender)
  ).toString();

  console.log(`Sender token balance on evm1 network after: ${balanceAfter}`);
  console.log(
    `Sender token balance on substrate network after: ${destinationBalanceAfter.toString()}`
  );
}

export async function fungibleTransferFromSubstrate(): Promise<void> {
  const keyring = new Keyring({ type: "sr25519" });
  await cryptoWaitReady();
  const account = keyring.addFromUri(ALICE_MNEMONIC);

  const api = await ApiPromise.create({ provider: wsProvider });

  const destinationErc20LRContract = ERC20PresetMinterPauser__factory.connect(
    ERC20_TOKEN_ADDRESS,
    wallet
  );
  const destinationBalanceBefore = await destinationErc20LRContract.balanceOf(
    EVM_DESTINATION_ADDRESS
  );

  const sourceBalanceBefore = (
    await api.query.assets.account(2000, account.address)
  ).toHuman() as { balance: string };
  console.log(`Transferring 5 tokens from substrate to evm1.`);
  console.log(`Sender (Alice): ${account.address}`);
  console.log(
    `Alice token balance on substrate network before:${sourceBalanceBefore.balance}`
  );
  console.log(
    `Alice token balance on evm1 network before:${destinationBalanceBefore.toString()}`
  );

  const assetTransfer = new SubstrateAssetTransfer();
  await assetTransfer.init(api, Environment.LOCAL);

  const transfer = await assetTransfer.createFungibleTransfer(
    account.address,
    EVM1_CHAIN_ID,
    EVM_DESTINATION_ADDRESS,
    RESOURCE_ID,
    "5000000000000" // 12 Decimals
  );

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

    return;
  });

  console.log("Waiting for relayers to bridge transaction...");

  let i = 0;
  let destinationBalanceAfter: BigNumber;
  for (; ;) {
    await sleep(7000);
    destinationBalanceAfter = await destinationErc20LRContract.balanceOf(
      EVM_DESTINATION_ADDRESS
    );
    if (!destinationBalanceAfter.eq(destinationBalanceBefore)) {
      console.log("Transaction successfully bridged.");
      break;
    }
    i++;
    if (i > 5) {
      // transaction should have been bridged already
      console.log("transaction is taking too much time to bridge!");
      break;
    }
  }

  const balanceAfter = (
    await api.query.assets.account(2000, account.address)
  ).toHuman() as { balance: string };

  console.log(
    `Alice token balance on substrate network after: ${balanceAfter.balance}`
  );
  console.log(
    `Alice token balance on evm1 network after: ${destinationBalanceAfter.toString()}`
  );

  return;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

// start specific example based on process arg
switch (process.argv[2]) {
  case "1":
    fungibleTransferFromEVM().finally(() => { });
    break;
  case "2":
    fungibleTransferFromSubstrate().finally(() => { });
    break;
  default:
    console.log("example not supported");
}

