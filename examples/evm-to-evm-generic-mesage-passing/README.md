## Sygma SDK Generic Message Example

This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem. The script showcases generic message passing (execution of a function on the destination chain) between two networks using the Sygma SDK.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js installed on your machine
- Yarn (version 3.4.1 or higher)
- A development wallet funded with [Sepolia ETH](https://sepolia-faucet.pk910.de/) for gas 
- The [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) of your development wallet
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

Create a `.env` file in the evm-to-evm GMP example folder:

```bash
cd examples/evm-to-evm-generic-mesage-passing
touch .env
```

Replace between the quotation marks your exported private key:

`PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"`

To call the function on the destination chain contract, `cd` into the example folder `examples/evm-to-evm-generic-mesage-passing` and run:

```bash
yarn run transfer
```

The example will use `ethers` in conjuction with the sygma-sdk to 
call a function on a smart contract on `Base-Sepolia` by calling the Deposit method on `Sepolia` and passing the details of the function to be called.

Replace the placeholder values in the `.env` file with your own Ethereum wallet private key.

**Note**

To replace default rpc Base-Sepolia and Sepolia urls use env variables:
- `BASE_SEPOLIA_RPC_URL="BASE_SEPOLIA_RPC_URL_HERE"`
- `SEPOLIA_RPC_URL="SEPOLIA_RPC_URL_HERE"`

## Script Functionality

This example script performs the following steps:
- initializes the SDK and establishes a connection to the Ethereum provider.
- retrieves the list of supported domains and resources from the SDK configuration.
- Searches for the Generic Message Passing resource from the list of supported resources registered.  
- Searches for the Base-Sepolia and Sepolia domains in the list of supported domains based on their chain IDs.
- Constructs a transfer object that defines the details of the destination chain smart contract, function and call-data
- Builds the final transfer transaction and sends it using the Ethereum wallet.
