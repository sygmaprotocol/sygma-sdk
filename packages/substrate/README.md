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

## Environment Setup.

## Support

Bridge configuration and list of supported networks for each environment can be found at: [Sygma bridge shared configuration github](https://github.com/sygmaprotocol/sygma-shared-configuration)

## Usage

### Fungible Token Transfers

```typescript
import { createSubstrateFungibleAssetTransfer } from '@buildwithsygma/substrate';
import { Environment } from '@buildwithsygma/core';
...
const transferParams = {
  sourceDomain: 5231,
  destinationDomain: 11155111,
  sourceNetworkProvider: apiPromise,
  resource: '0x0000000000000000000000000000000000000000000000000000000000001100',
  amount: BigInt('5000000'),
  destinationAddress: recipientAddress,
  environment: Environment.TESTNET
};
...
const transfer = await createSubstrateFungibleAssetTransfer(transferParams);
const transferTx = await transfer.getTransferTransaction();
```

## Examples

The SDK monorepo contains the following examples demonstrating the usage of Substrate Package:

1. [Fungible Token Transfer from Substrate](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/substrate-to-evm-fungible-transfer)
2. [Fungible Token Transfer from Evm](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-substrate-fungible-transfer)
