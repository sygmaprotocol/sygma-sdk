## Introduction

This package provides the latest typescript EVM SDK for building products using Sygma Protocol.

## Installation

```
yarn add @buildwithsygma/evm
```

or

```
npm install @buildwithsygma/evm
```

## Environment Setup

## Support.

Bridge configuration and list of supported networks for each environment can be found at: [Sygma bridge shared configuration github](https://github.com/sygmaprotocol/sygma-shared-configuration)

## Usage

### Fungible Token Transfers

```typescript
import { Environment } from '@buildwithsygma/core';
import { createFungibleAssetTransfer } from '@buildwithsygma/evm';
...
const transfer = await createFungibleAssetTransfer({
  source: 11155111,
  destination: 17000,
  sourceNetworkProvider: provider,
  resource: '0x0000000000000000000000000000000000000000000000000000000000000200',
  amount: BigInt(2) * BigInt(1e18),
  recipientAddress: "<destination_address>",
  sourceAddress: senderAddress,
  environment: Environment.TESTNET
});
...
const approvalTransactions = await transfer.getApprovalTransactions();
const transferTransaction = await transfer.getTransferTransaction();
```

### Non Fungible Token Transfers

```typescript
import { Environment } from '@buildwithsygma/core';
import { createNonFungibleAssetTransfer } from '@buildwithsygma/evm';
...
const transfer = await createNonFungibleAssetTransfer({
  source: 11155111,
  destination: 17000,
  sourceNetworkProvider: provider,
  resource: '0x0000000000000000000000000000000000000000000000000000000000000200',
  tokenId: "1",
  recipientAddress: "<destination_address>",
  sourceAddress: senderAddress,
  environment: Environment.TESTNET
});
...
const approvalTransactions = await transfer.getApprovalTransactions();
const transferTransaction = await transfer.getTransferTransaction();
```

### Generic Transfers

```typescript
import { Environment } from '@buildwithsygma/core';
import { createCrossChainContractCall } from '@buildwithsygma/evm';

const destinationContractAbi = [ { ... } ] as const;
const functionName = "function" as const;
const functionParameters = ["0x0...", 0] as const;
const destinationContractAddress = "0x...";

const transfer = await createCrossChainContractCall<
    typeof destinationContractAbi,
    contractFunction
>({
    gasLimit: BigInt(0),
    functionParameters,
    functionName,
    destinationContractAbi,
    destinationContractAddress,
    maxFee: BigInt(MAX_FEE),
    source: 11155111,
    destination: 17000,
    sourceNetworkProvider: provider,
    sourceAddress: senderAddress,
    resource: RESOURCE_ID,
    environment: Environment.TESTNET
});

const transferTransaction = await transfer.getTransferTransaction();
```

## Examples

The SDK monorepo contains the following examples demonstrating the usage of EVM Package:

1. [Fungible Token Transfers](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-evm-fungible-transfer)
2. [Non Fungible Token Transfers](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-evm-non-fungible-transfer)
3. [Generic Transfers/Contract Calls](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-evm-generic-message-transfer)
