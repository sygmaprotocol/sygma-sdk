import { Keyring } from "@polkadot/keyring";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import {
  Environment,
  Fungible,
  SubstrateAssetTransfer,
  SubstrateParachain,
  Transfer,
} from "@buildwithsygma/sygma-sdk-core";

const ROCOCO_CHAIN_ID = 5231;
const SEPOLIA_CHAIN_ID = 11155111;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001000";
const MNEMONIC =
  "zoo slim stable violin scorpion enrich cancel bar shrug warm proof chimney";
const recipient = "0x0da26Cd0578C98b44b9Ff554dd234E2822E6bf11";

const substrateTransfer = async (): Promise<void> => {
  const keyring = new Keyring({ type: "sr25519" });
  // Make sure to fund this account with native tokens
  // Account address: 5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS

  await cryptoWaitReady();

  const account = keyring.addFromUri(MNEMONIC);

  const wsProvider = new WsProvider(
    "wss://subbridge-test.phala.network/rhala/ws"
  );
  const api = await ApiPromise.create({ provider: wsProvider });

  const assetTransfer = new SubstrateAssetTransfer();

  await assetTransfer.init(
    api,
    SubstrateParachain.ROCOCO_PHALA,
    Environment.TESTNET
  );

  const domains = assetTransfer.config.getDomains();
  const resources = assetTransfer.config.getDomainResources();
  const selectedResource = resources.find(
    (resource) => resource.resourceId == RESOURCE_ID
  );
  if (!selectedResource) {
    throw new Error("Resource not found");
  }
  const rococo = domains.find((domain) => domain.chainId == ROCOCO_CHAIN_ID);
  if (!rococo) {
    throw new Error("Network Rococo-Phala not supported");
  }
  const sepolia = domains.find((domain) => domain.chainId == SEPOLIA_CHAIN_ID);
  if (!sepolia) {
    throw new Error("Network sepolia not supported");
  }

  const transfer: Transfer<Fungible> = {
    sender: account.address,
    amount: {
      // amount in wei
      amount: "50",
    },
    from: rococo,
    to: sepolia,
    resource: selectedResource,
    recipient: recipient,
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
};

substrateTransfer().catch((e) => console.log(e));
