# Sygma SDK BTC to EVM example

## Sygma SDK ERC20 Example

This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem. The script showcases a asset transfer between a BTC testnet account and a EVM Sepolia account.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js
- Yarn (version 3.4.1 or higher)
- A development wallet with some testnet BTC
- The private key of a Taproot address to sign the transaction
- Valid UTXO information of your taproot address. You can get the UTXO's of your address by querying some public APIS like blockstream one and passing your address as parameter

## Getting started

### 1. Clone the repository

To get started, clone this repository to your local machine with:

```bash
git clone git@github.com:sygmaprotocol/sygma-sdk.git
cd sygma-sdk/
```

### 2. Install dependencies

Install the project dependencies by running:

```bash
yarn install
```

### 3. Build the sdk

To start the example you need to build the sdk first with:

```bash
yarn build:all
```

## Usage

This example uses the `dotenv` module to manage private keys and also to define env variables needed for this example to work. To run the example, you will need to configure your environment variables A `.env.sample` is provided as a template.

**DO NOT COMMIT PRIVATE KEYS WITH REAL FUNDS TO GITHUB. DOING SO COULD RESULT IN COMPLETE LOSS OF YOUR FUNDS.**

Create a `.env` file in the btc-to-evm example folder:

```bash
cd examples/btc-to-evm-fungible-transfer
touch .env
```

Replace the values that are defined in the `.env.sample` file:

```bash
SYGMA_ENV=testnet
BLOCKSTREAM_URL="your blockstream url"
DESTINATION_ADDRESS="your evm destination address"
DESTINATION_CHAIN_ID="destination domain chain id"
RESOURCE_ID="resource id"
SOURCE_CAIPID="source domain caip id"
EXPLORER_URL="your bitcoin explorer url"
MNEMONIC="your 12 or 24 mnemonic"
DERIVATION_PATH="your derivation path"
ADDRESS="your change address"
AMOUNT="your amount to transfer"
```

* `DESTINATION_ADDRESS`: your `evm` destination address where you want your funds to be relayed
* `DESTINATION_CHAIN_ID`: this is the chainId of the network where you want to receive the funds
* `RESOURCE_ID`: the bitcoin resource id that can be found in our `shared-config` repository
* `SOURCE_CAIPID`: caipId of the bitcoin domain
* `MNEMONIC`: your testnet wallet mnemonic
* `DERIVATION_PATH`: derivation path for your mnemonic. Use derivation path for either P2TR address or P2WPKH one
* `ADDRESS`: the address from which we get the UTXO's and to which we send the change
* `AMOUNT`: the actual amount to transfer

Take into consideration that a typical response when query the utxos of your address look like this:

```json
{
  "txid": "7bdf2ce472ee3c9cba6d2944b0ca6bcdceb4b893c7d2163678a0b688a8315d74",
  "vout": 3,
  "status": {
      "confirmed": true,
      "block_height": 2869535,
      "block_hash": "",
      "block_time": 1721666904
  },
  "value": 936396`
}
```

Where `value` is the amount you have at your disposal and `vout` is the transaction output index.

To send Testnet BTC to your EVM account on Sepolia using Taproot address run:

```bash
yarn run transfer:p2tr
```

To send Testnet BTC to your EVM account on Sepolia using P2WPKH address run:

```bash
yarn run transfer:p2wpkh
```

Replace the placeholder values in the `.env` file with your own Testnet BTC Taproot private key as well as the other env variables needed such as DESTINATION_ADDRESS, DESTINATION_DOMAIN_ID, RESOURCE_ID and SOURCE_DOMAIN_ID.

## Script Functionality

This example script performs the following steps:
- I creates a signer to sign the Bitcoin Testnet transaction using your provider private key from your taproot address.
- it gets the fee for 5 confirmations blocks. You can change that following this [reference](https://github.com/Blockstream/esplora/blob/master/API.md#get-fee-estimates)
- it then encodes the provided EVM address + the destination domain id needed to relay the funds
- Once you have provided with the UTXO information needed, it will calculate the fee of the transaction based on some aproximation value
- it then instantiate a PSBT class to be able to provide the inputs and outputs needed to relay the assets
- It signs the transaction and the broadcasted into the Bitcoin testnet network. You will get an url with the transaction id to follow the confirmation of the transaction.
