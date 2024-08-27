# Sygma SDK EVM to BTC example

This is an example that demonstrates functionality of the protocol using Sygma SDK. The src/transfer.ts script showcases how bitcoins can be transferred from an EVM Sepolia account utilizing `@buildwithsygma/evm` package.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js
- Yarn (version 3.4.1 or higher)
- A development wallet funded with `sygBTC` tokens from the [Sygma faucet](https://faucet-ui-stage.buildwithsygma.com/)
- The [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) of your development wallet
- [Sepolia ETH](https://www.alchemy.com/faucets/ethereum-sepolia) for gas 
- An Ethereum [provider](https://www.infura.io/) (in case the hardcoded RPC within the script does not work)

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

This example uses the `dotenv` module to manage private keys. To run the example, you will need to configure your environment variable to include your test development account's [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key). A `.env.sample` is provided as a template.

**DO NOT COMMIT PRIVATE KEYS WITH REAL FUNDS TO GITHUB. DOING SO COULD RESULT IN COMPLETE LOSS OF YOUR FUNDS.**

Create a `.env` file in the evm-to-evm example folder:

```bash
cd examples/evm-to-btc-fungible-transfer
touch .env
```

Replace between the quotation marks your exported private key:

`PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"`

To send an ERC20 example transfer run:

```bash
yarn run transfer
```

The example will use `ethers` in conjuction with the sygma-sdk to 
create a transfer from `Sepolia` to `Testnet BTC` with a test sygBTC token.

Replace the placeholder values in the `.env` file with your own Ethereum wallet private key.

## Script Functionality

This example script performs the following steps:
- initializes the SDK and establishes a connection to the Ethereum provider.
- retrieves the list of supported domains and resources from the SDK configuration.
- Searches for the sygBTC token resource with the specified symbol 
- Searches for the Bitcoin Testnet and Sepolia domains in the list of supported domains based on their chain IDs and CaipId
- Constructs a transfer object that defines the details of the sygBTC token transfer
- Retrieves the fee required for the transfer from the SDK.
- Builds the necessary approval transactions for the transfer and sends them using the Ethereum wallet. The approval transactions are required to authorize the transfer of ERC20 token.
- Builds the final transfer transaction and sends it using the Ethereum wallet.
