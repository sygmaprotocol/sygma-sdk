## Introduction

This package provides utility functions for Sygma SDK.

## Installation

```
yarn add @buildwithsygma/utils
```

or

```
npm install @buildwithsygma/utils
```

### Usage

Currently you can use the `hasEnoughLiquidity` function to check if there is enough liquidity on the destination handler for the transfer to be completed.

```javascript
import { hasEnoughLiquidity } from '@buildwithsygma/utils';
import { createEvmFungibleAssetTransfer } from '@buildwithsygma/evm';

const transfer = await createEvmFungibleAssetTransfer({
  source: 11155111,
  destination: 17000,
  sourceNetworkProvider: provider,
  resource: '0x0000000000000000000000000000000000000000000000000000000000000200',
  amount: BigInt(2) * BigInt(1e18),
  destinationAddress: destinationAddress,
  sourceAddress: senderAddress,
});

const destinationProviderUrl = 'your-provider-url'

const hasEnoughLiquidity = hasEnoughLiquidity(transfer, destinationProviderUrl);
```
