## Sygma SDK ERC20 Example

This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem. The script showcases an ERC20 token transfer between an EVM network and a Substrate network using the Sygma SDK.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js installed on your machine
- Yarn (version 3.4.1 or higher)
- A development wallet funded with `gPHA` tokens from the [Sygma faucet](https://faucet-ui-stage.buildwithsygma.com/)
- The [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) of your development wallet
- A Substrate wallet to receive tokens into (the example presets an existing wallet address already)
- [Sepolia ETH](https://sepoliafaucet.com/) for gas 
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
yarn sdk:build
```

## Usage

This example uses the `dotenv` module to manage private keys. To run the example, you will need to configure your environment variable to include your test development account's [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key). A `.env.sample` is provided as a template.

**DO NOT COMMIT PRIVATE KEYS WITH REAL FUNDS TO GITHUB. DOING SO COULD RESULT IN COMPLETE LOSS OF YOUR FUNDS.**

Create a `.env` file in the evm-to-substrate example folder:

```bash
cd examples/evm-to-substrate-fungible-transfer
touch .env
```

Replace between the quotation marks your exported private key:

`PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"`

To send a ERC20 example transfer run:

```bash
yarn run transfer
```

The example will use `ethers` in conjuction with the sygma-sdk to
create a transfer from `Sepolia` to `Rococo-Phala` with a GPHA token.

Replace the placeholder values in the `.env` file with your own Ethereum wallet private key, and your own destination Substrate address within the script.

**Note**

To replace default rpc Sepolia urls use env variables:
- `SEPOLIA_RPC_URL="SEPOLIA_RPC_URL_HERE"`

## Script Functionality

This example script performs the following steps:

- initializes the SDK and establishes a connection to the Ethereum provider.
- retrieves the list of supported domains and resources from the SDK configuration.
- Searches for the ERC20 token resource with the specified symbol
- Searches for the Sepolia and Rococo-Phala domains in the list of supported domains based on their chain IDs
- Constructs a transfer object that defines the details of the ERC20 token transfer
- Retrieves the fee required for the transfer from the SDK.
- Builds the necessary approval transactions for the transfer and sends them using the Ethereum wallet. The approval transactions are required to authorize the transfer of ERC20 tokens.
- Builds the final transfer transaction and sends it using the Ethereum wallet.
