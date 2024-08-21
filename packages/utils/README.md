## Introduction

This package provides utility functions for seamless integration of Sygma SDK.

[`@buildwithsygma/evm`](../evm/README.md) and [`@buildwithsygma/substrate`](../substrate/README.md) packages can be used to transfer tokens from one network to another. However, there is a possibilty that the transfer might fail due to insufficient liquidity on Sygma protocol handlers. Therefore, this package provides utility function that can be used to avoid such failures.

## Installation

```
yarn add @buildwithsygma/utils
```

or

```
npm install @buildwithsygma/utils
```

### Function: `hasEnoughLiquidity`

#### Example

```typescript
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
...
// destination provider RPC URL
const destinationProviderUrl = 'your-provider-url'
const hasEnoughLiquidity = await hasEnoughLiquidity(transfer, destinationProviderUrl);
```
