## Introduction

This package provides the latest typescript Bitcoin SDK for building products using Sygma Protocol.

## Installation

```
yarn add @buildwithsygma/bitcoin
```

or

```
npm install @buildwithsygma/bitcoin
```

## Environment Setup

Make sure to set environment variable `SYGMA_ENV` to either `TESTNET` or `MAINNET` prior to using the SDK.

## Support.

Bridge configuration and list of supported networks for each environment can be found at: [Sygma bridge shared configuration github](https://github.com/sygmaprotocol/sygma-shared-configuration)

## Usage

### Bitcoin transfer

#### Preparations

You can use our utils to fetch the UTXOS needed from your address to transfer the assets:

```typescript
import {
  broadcastTransaction,
  fetchUTXOS,
  getFeeEstimates,
  processUtxos,
} from '@buildwithsygma/utils';
import type { UTXOData } from '@buildwithsygma/bitcoin';

// Either P2TR address or P2WPKH address
const utxos = await fetchUTXOS('tb1...' as unknown as string);

const processedUtxos = processUtxos(utxos, 1e8);

// Here we map the UTXOs to match the shape that the SDK expect, to use them as inputs in the transaction
const mapedUtxos = processedUtxos.map(utxo => ({
  utxoTxId: utxo.txid,
  utxoOutputIndex: utxo.vout,
  utxoAmount: BigInt(utxo.value),
})) as unknown as UTXOData[];

// You can also get estimation of the fees per block confirmation in either testnet or mainnet
const feeRate = await getFeeEstimates('5');
```

#### Pay to Taproot transfer

```typescript
import { createBitcoinFungibleTransfer, TypeOfAddress } from '@buildwithsygma/bitcoin';
import type { BitcoinTransferParams, UTXOData } from '@buildwithsygma/bitcoin';
import { networks } from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';

// Here we create the public key needed for the P2TR transfer. You can reference our bitcoin-to-evm example to check the steps to get the public key and the signer
// derivedNode.publicKey is one of your account given the derivation path that you provide
const publicKeyDropedDERHeader = toXOnly(derivedNode.publicKey);

const transferParams: BitcoinTransferParams = {
  source: 'bip122:000000000933ea01ad0ee984209779ba',
  destination: 11155111,
  destinationAddress: '0x...', // evm address here
  amount: 1e8,
  resource: '0x0000000000000000000000000000000000000000000000000000000000000300',
  utxoData: mapedUtxos,
  feeRate: BigInt(Math.ceil(feeRate)),
  publicKey: publicKeyDropedDERHeader,
  typeOfAddress: TypeOfAddress.P2TR,
  network: networks.testnet,
  changeAddress: 'tb1...', // the address to receive the amount that's left after the transaction
  size: BigInt(size), // size of the transfer, either based on other transfer, some calculation or the number you want to input here
};

const transfer = await createBitcoinFungibleTransfer(transferParams);

const psbt = transfer.getTransferTransaction();

psbt.signAllInputs(signer); // tweaked signer, check our example for further reference on how to get this for P2TR transfers
psbt.finalizeAllInputs();
const tx = psbt.extractTransaction(true);

// You can check the hex encoded raw signed transaction
console.log('Transaction hex', tx.toHex());
```

#### Pay to Witness Public Key Hash

```typescript
import type { BitcoinTransferParams, UTXOData } from '@buildwithsygma/bitcoin';
import { createBitcoinFungibleTransfer, TypeOfAddress } from '@buildwithsygma/bitcoin';
import { networks } from 'bitcoinjs-lib';

const derivedNode = rootKey.derivePath('your-derivation-path');

const transferParams: BitcoinTransferParams = {
  source: 'bip122:000000000933ea01ad0ee984209779ba',
  destination: 11155111,
  destinationAddress: '0x...', // evm address here
  amount: 1e8,
  resource: '0x0000000000000000000000000000000000000000000000000000000000000300',
  utxoData: mapedUtxos,
  publicKey: derivedNode.publicKey,
  typeOfAddress: TypeOfAddress.P2WPKH,
  network: networks.testnet,
  changeAddress: 'tb1...', // the address to receive the amount that's left after the transaction
  feeRate: BigInt(Math.ceil(feeRate)),
  size: BigInt(size), // size of the transfer, either based on other transfer, some calculation or the number you want to input here
};

const transfer = await createBitcoinFungibleTransfer(transferParams);

const psbt = transfer.getTransferTransaction();

psbt.signAllInputs(signer); // signer, check our example for further reference on how to get this for P2WPKH transfers
psbt.finalizeAllInputs();
const tx = psbt.extractTransaction(true);

// You can check the hex encoded raw signed transaction
console.log('Transaction hex', tx.toHex());
```

## Examples

The SDK monorepo contains the following examples demonstrating the usage of EVM Package:

1. [Pay to Taproot address](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/bitcoin-to-evm-fungible-transfer)
2. [Pay to Witnes Public Key Hahs](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-bitcoin-fungible-transfer)
