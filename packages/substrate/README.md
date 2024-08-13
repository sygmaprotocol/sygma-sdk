## Introduction

This package provides the latest typescript Substrate SDK for building products using Sygma Protocol.

## Installation

```
yarn add @buildwithsygma/substrate
```

or

```
npm install @buildwithsygma/substrate
```

## Environment Setup

Make sure to set environment variable `SYGMA_ENV` to either `TESTNET` or `MAINNET` prior to using the SDK.

## Support

Bridge configuration and list of supported networks for each environment can be found at: [Sygma bridge shared configuration github](https://github.com/sygmaprotocol/sygma-shared-configuration)

## Usage

### Fungible Token Transfers

```typescript
import type { SubstrateAssetTransferRequest } from '@buildwithsygma/substrate';
import { createSubstrateFungibleAssetTransfer } from '@buildwithsygma/substrate';

const MNEMONIC = process.env.PRIVATE_MNEMONIC;
const RHALA_RPC_URL = process.env.RHALA_RPC_URL;

const wsProvider = new WsProvider(RHALA_RPC_URL);
const api = await ApiPromise.create({ provider: wsProvider });

const keyring = new Keyring({ type: 'sr25519' });
await cryptoWaitReady();
const account = keyring.addFromUri(MNEMONIC);

const transferParams = {
  sourceDomain: 5231,
  destinationDomain: 11155111,
  sourceNetworkProvider: api,
  resource: '0x0000000000000000000000000000000000000000000000000000000000001100',
  amount: BigInt('5000000'),
  destinationAddress: recipient,
};

const transfer = await createSubstrateFungibleAssetTransfer(transferParams);
const transferTx = await transfer.getTransferTransaction();

await transferTx.signAndSend(account);

const approvalTransactions = await transfer.getApprovalTransactions();
for (const approvalTransaction of approvalTransactions) {
  await wallet.sendTransaction(approvalTransaction);
}

const transferTransaction = await transfer.getTransferTransaction();
await wallet.sendTransaction(transferTransaction);
```

## Examples

The SDK monorepo contains the following examples demonstrating the usage of Substrate Package:

1. [Fungible Token Transfer from Substrate](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/substrate-to-evm-fungible-transfer)
2. [Fungible Token Transfer from Evm](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-substrate-fungible-transfer)
