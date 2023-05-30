import { Keyring } from "@polkadot/keyring";
import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  Domain,
  Environment,
  Fungible,
  Resource,
  SubstrateAssetTransfer,
  SubstrateParachain,
  Transfer,
} from "@buildwithsygma/sygma-sdk-core";

export const ROCOCO_CHAIN_ID = 5231
export const SEPOLIA_CHAIN_ID = 11155111;


export async function substrateTransfer(): Promise<void> {


  const keyring = new Keyring({ type: "sr25519" });
  // Make sure to fund this accoubnt with both native and asset tokens
  // Account address: 5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS
  const mnemonic =
    "zoo slim stable violin scorpion enrich cancel bar shrug warm proof chimney";
  const account = keyring.addFromUri(mnemonic);

  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  const assetTransfer = new SubstrateAssetTransfer();

  await assetTransfer.init(
    api,
    Environment.TESTNET,
    SubstrateParachain.ROCOCO_PHALA
  );

  const domains: Array<Domain> = assetTransfer.config.getDomains();
  const resources: Array<Resource> = assetTransfer.config.getDomainResources();
  // const erc20Resource = resources.find(
  //   (resource) => resource.symbol == ERC20_TOKEN_SYMBOL
  // );
  // if (!erc20Resource) {
  //   throw new Error("Resource not found");
  // }
  const rococo = domains.find((domain) => domain.chainId == ROCOCO_CHAIN_ID);
  if (!rococo) {
    throw new Error("Network goerli not supported");
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
    resource: erc20Resource,
    recipient: account.getAddress(),
  };

  const fee = await assetTransfer.getFee(transfer);

  const transferTx = await assetTransfer.buildTransferTransaction(
    transfer,
    fee
  );

  const unsub = await transferTx.signAndSend(account, ({ status }) => {
    console.log(`Current status is ${status.toString()}`);

    if (status.isInBlock) {
      console.log(`Transaction included at blockHash ${status.asInBlock.toString()}`);
    } else if (status.isFinalized) {
      console.log(`Transaction finalized at blockHash ${status.asFinalized.toString()}`);
      unsub();
    }
  });
}

erc20Transfer().finally(() => { });
