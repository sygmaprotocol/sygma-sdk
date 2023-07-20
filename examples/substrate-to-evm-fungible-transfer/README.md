## Sygma SDK Substrate Asset Transfer Example

This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem. The script showcases a Substrate Asset transfer between Substrate and EVM using the Sygma SDK.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js installed on your machine
- [Yarn](https://yarnpkg.com/) (version 3.4.1 or higher)
- Access to a Substrate node

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

This example uses the `dotenv` module to import the 12-word private mnemonic. To run the example, you will need to configure your environment variable to include your test development account's [12-word seed](https://support.polkadot.network/support/solutions/articles/65000169731-polkadot-extension-how-can-i-view-my-mnemonic-phrase-). A `.env.sample` is provided as a template.

**DO NOT COMMIT YOUR MENOMONIC WITH REAL FUNDS TO GITHUB. DOING SO COULD RESULT IN COMPLETE LOSS OF YOUR FUNDS.**

Create a `.env` file in the substrate-to-evm example folder:

```bash
cd examples/substrate-to-evm-fungible-transfer
touch .env
```

Replace between the quotation marks your 12-word mnemonic:

`PRIVATE_MNEMONIC="YOUR TWELVE WORD MNEMONIC HERE WITH SPACES"`

To send a Substrate token to an EVM chain example transfer run:

```bash
yarn run transfer
```

The example will use `@polkadot/keyring` in conjuction with the sygma-sdk to
create a transfer from `Roccoco Phala` to `Sepolia`.

Replace the placeholder values in the script with your own Substrate wallet mnemonic and destination EVM address.

## Script Functionality

This example script performs the following steps:

- initializes the SDK and establishes a connection to the Substrate node.
- retrieves the list of supported domains and resources from the SDK configuration.
- Searches for the Substrate asset resource with the specified ResourceId
- Searches for the Goerli and Sepolia domains in the list of supported domains based on their chain IDs
- Constructs a transfer object that defines the details of the Substrate asset transfer
- Retrieves the fee required for the transfer from the SDK.
- Builds the final transfer transaction and sends it using the Substrate account.
