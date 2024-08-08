
This package provides the latest typescript core primivites for the Sygma SDK packages.

## Installation

```
yarn add @buildwithsygma/core
```

or

```
npm install @buildwithsygma/core
```

## Environment Setup

Make sure to set environment variable `SYGMA_ENV` to either `TESTNET` or `MAINNET` prior to using the SDK.

## Support

### Usage

```javascript
import {
  Config
} from '@buildwithsygma/core';

const config = new Config();
await config.init(process.env.SYGMA_ENV);

const domainConfig = config.getDomainConfig(11155111); // sepolia chain Id
```