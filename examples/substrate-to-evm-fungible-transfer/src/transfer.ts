import { Keyring } from "@polkadot/keyring";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import {
  Environment,
  SubstrateAssetTransfer,
} from "@buildwithsygma/sygma-sdk-core";

const GOERLI_CHAIN_ID = 5;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001000";
const MNEMONIC =
  "zoo slim stable violin scorpion enrich cancel bar shrug warm proof chimney";
const recipient = "0xD31E89feccCf6f2DE10EaC92ADffF48D802b695C";

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

  await assetTransfer.init(api, Environment.TESTNET);

  const transfer = assetTransfer.createFungibleTransfer(
    account.address,
    GOERLI_CHAIN_ID,
    recipient,
    RESOURCE_ID,
    "5000000000000"
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
  });
};

substrateTransfer()
  .catch((e) => console.log(e))
  .finally(() => { });
