## Sygma SDK ERC20 + Contract Call Example

This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem. The script showcases an ERC20 token transfer with a contract call between the same account on two different testnets using the Sygma SDK.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js
- Yarn (version 3.4.1 or higher)
- A development wallet funded with `ERC20LRTest` tokens from the [Sygma faucet](https://faucet-ui-stage.buildwithsygma.com/)
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
cd examples/evm-to-evm-fungible-transfer
touch .env
```

Replace between the quotation marks your exported private key:

`PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"`

Run the transfer script using:

```bash
yarn run transfer
```

The example will use `ethers` in conjuction with the sygma-sdk to
create a transfer from `Sepolia` to `Holesky` with a test ERC20 token.

Replace the placeholder values in the `.env` file with your own Ethereum wallet private key.

**Note**

To replace default rpc Cronos and Sepolia urls use env variables:

- `SEPOLIA_RPC_URL="SEPOLIA_RPC_URL_HERE"`
