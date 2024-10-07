## Sygma SDK Substrate to EVM (Tangle to Sepolia) Asset Transfer Example
This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem. The script showcases a Substrate Asset transfer between a Substrate network and an EVM network using the Sygma SDK.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js installed on your machine (v18.20.4)
- Yarn (version 3.4.1 or higher)
- A Substrate development wallet funded with `TANGLE` tokens; **you may wish** to run the [EVM-to-Substrate example](../evm-to-substrate-fungible-transfer) first to preload `PHA` tokens into a Substrate wallet
- The 12-word mnemonic for your Substrate development wallet
- An Ethereum wallet to receive tokens into (the example presets an existing wallet address already)
- A Substrate provider (in case the hardcoded WSS within the script does not work)

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

### Obtaining sygUSD Tokens
The `RESOURCE_ID_SYGMA_USD` represents the ID for `sygUSD` tokens in the Sygma protocol. You will need `sygUSD` testnet tokens to complete this transfer. If you are transferring a different asset, you may need to replace this ID with the appropriate resource ID.

You can obtain testnet `sygUSD` tokens for the Tangle testnet by visiting the [Sygma Testnet Faucet](https://docs.buildwithsygma.com/resources/environments/testnet/obtain-testnet-tokens/?ref=blog.buildwithsygma.com).

## Usage

This example uses the `dotenv` module to import the 12-word private mnemonic. To run the example, you will need to configure your environment variable to include your test development account's [12-word seed](https://support.polkadot.network/support/solutions/articles/65000169731-polkadot-extension-how-can-i-view-my-mnemonic-phrase-). A `.env.sample` is provided as a template.

**DO NOT COMMIT YOUR MNEMONIC WITH REAL FUNDS TO GITHUB. DOING SO COULD RESULT IN COMPLETE LOSS OF YOUR FUNDS.**

### Environment Variables
Create a `.env` file in the substrate-to-evm example folder:

```bash
touch .env
```
The file should contain the following environment variables:

- PRIVATE_MNEMONIC: The 12-word mnemonic for your Substrate wallet.
- SOURCE_SUBSTRATE_RPC_URL: The WebSocket URL of the Substrate network (Tangle in this example).
- RECIPIENT_ADDRESS: The destination EVM address that will receive the tokens (Sepolia testnet in this example).
- SYGMA_ENV: The Sygma environment you’re using, e.g., testnet.

Here’s an example of the .env file:
```bash
PRIVATE_MNEMONIC="YOUR TWELVE WORD MNEMONIC HERE"
SOURCE_SUBSTRATE_RPC_URL="wss://rpc.tangle.tools"
RECIPIENT_ADDRESS="YOUR EVM ADDRESS"
SYGMA_ENV="testnet"
````

### Obtaining Your 12-Word Mnemonic

To create a Substrate wallet and obtain the 12-word mnemonic, follow this [Polkadot wallet guide](https://support.polkadot.network/support/solutions/articles/65000169731-polkadot-extension-how-can-i-view-my-mnemonic-phrase-).

Replace between the quotation marks your 12-word mnemonic:

`PRIVATE_MNEMONIC="YOUR TWELVE WORD MNEMONIC HERE WITH SPACES"`

### Run the example
To send a Substrate token to an EVM chain example transfer run:

```bash
yarn run transfer
```

The example will use `@polkadot/keyring` in conjunction with the sygma-sdk to
create a transfer from `Tangle` to `Sepolia`.

Replace the placeholder values in the `.env` file with your own Substrate wallet mnemonic, and your own destination EVM address within the script.

### Monitoring the Transfer

Once the transaction is finalized, you can view the transaction details in the [Sygma Explorer](https://scan.test.buildwithsygma.com).

**Note**

To replace default rpc TANGLE url use env variable:
- `SOURCE_SUBSTRATE_RPC_URL="TANGLE_RPC_URL_HERE"`

## Script Functionality

This example script performs the following steps:

1. **Initializes the SDK**: It connects to the Substrate node via WebSocket and initializes the SDK.
2. **Retrieves Supported Domains and Resources**: It fetches the list of supported domains (Tangle and Sepolia in this case) and resources like `sygUSD`.
3. **Constructs a Transfer Object**: A transfer object is built, specifying the token amount, the source, and destination chains (Tangle and Sepolia).
4. **Fetches Transfer Fees**: The SDK calculates the fees required for the transfer.
5. **Signs and Sends the Transaction**: The transfer transaction is signed with your Substrate account and broadcasted to the network.
6. **Monitors Transaction Status**: The script logs transaction statuses such as `InBlock` and `Finalized`. It provides a link to the [Sygma Explorer](https://scan.test.buildwithsygma.com) where the transaction can be monitored.
