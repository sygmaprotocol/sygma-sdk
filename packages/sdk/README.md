# @buildwithsygma/sygma-sdk-core

Core primitives for bridging and message passing

## Usage

Installation -
```bash
yarn add @buildwithsygma/sygma-sdk-core
```
Functions can be imported as follows:
```typescript
//EVM
import {
  calculateBasicfee,
  erc20Transfer,
  approve,
  getDepositEventFromReceipt,
  isEIP1559MaxFeePerGas,
  // etc
} from '@buildwithsygma/sygma-sdk-core/EVM';

//Substrate
import {
  getNativeTokenBalance,
  getAssetBalance,
  getBasicFee,
  deposit,
  handleTxExtrinsicResult,
  // etc
} from '@buildwithsygma/sygma-sdk-core/Substrate';
```

