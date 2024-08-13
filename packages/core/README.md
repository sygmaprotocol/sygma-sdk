This package provides the latest typescript core primivites for the Sygma SDK packages. Core package allows you to get information about our supported Networks and resources. It provides some utility functions to get specific information about either all our domains. There are methods to get route information for the Sygma Protocol, as well as validating addresses for all the protocols that we currently support.

## Installation

```
yarn add @buildwithsygma/core
```

or

```
npm install @buildwithsygma/core
```

## Environment Setup.

Make sure to set environment variable `SYGMA_ENV` to either `TESTNET` or `MAINNET` prior to using the SDK.

### Usage

#### Config class

```typescript
import { Config } from '@buildwithsygma/core';

const config = new Config();
await config.init(process.env.SYGMA_ENV);

// Gets domain config
const domainConfig = config.getDomainConfig(11155111); // sepolia chain Id

// Get all the Sygma Domains based on Network types
const domains = config.getDomains({ options: { networkTypes: ['evm'] } });

// Get all Sepolia resources
const resources = config.getResources(11155111);
```

#### Utility functions

```typescript
import {
  getSygmaScanLink,
  Environment,
  getDomains,
  getTransferStatus,
  getRoutes,
  getRawConfiguration,
  isValidSubstrateAddress,
  isValidEvmAddress,
  isValidBitcoinAddress,
  isValidAddressForNetwork,
} from '@buildwithsygma/core';

const sourceHash = '0x...';

// Get Sygma Scan link url
const sygmaScanLink = getSygmaScanLink(sourceHash, Environment.DEVNET);

// Get all the Sygma Domains
const domains = getDomains({ environment: Environment.DEVNET });

// Get all routes from Sepolia
const routes = getRoutes(11155111, Environment.DEVNET);

// Get status of the transfer on TESTNET
const txHash = '0x...';
const transferStatus = getTransferStatus(txHash, Environment.TESTNET);

// Get raw configuration
const rawConfig = getRawConfiguration(Environment.TESTNET);

// Validate Substrate address
const substrateAddress = '1v72SmRT7XHwSa6hpEhUrgspM9bpmDRNw3F4wucb2GwkynQ';
const isValidSubstrateADdress = isValidSubstrateAddress(substrateAddress);

// Validate EVM address
const evmAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
const isValidEvmAddress = isValidEvmAddress(evmAddress);

// Validate Bitcoin address
const bitcoinAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
const isValidBitcoinAddress = isValidBitcoinAddress(bitcoinAddress);

// More generic function to validate address based on network
const bitcoinAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
const isValidAddress = isValidAddressForNetwork(bitcoinAddress, Network.BITCOIN);
```
