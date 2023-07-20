## Sygma SDK Generic Message Example

This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem. The script showcases generic message passing (execution of a function on the destination chain) between two networks using the Sygma SDK.

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js installed on your machine
- [Yarn](https://yarnpkg.com/) (version 3.4.1 or higher)
- Access to an Ethereum provider

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

To call a function on a destination chain contract:

```bash
yarn run transfer
```

The example will use `ethers` in conjuction with the sygma-sdk to 
call a function on a smart contract on `Goerli` by calling the Deposit method on `Sepolia` and passing the details of the function to be called.

Replace the placeholder values in the `.env` file with your own Ethereum wallet private key and provider URL.

## Script Functionality

This example script performs the following steps:
- initializes the SDK and establishes a connection to the Ethereum provider.
- retrieves the list of supported domains and resources from the SDK configuration.
- Searches for the Generic Message Passing resource from the list of supported resources registered.  
- Searches for the Goerli and Sepolia domains in the list of supported domains based on their chain IDs.
- Constructs a transfer object that defines the details of the destination chain smart contract, function and call-data
- Builds the final transfer transaction and sends it using the Ethereum wallet.
