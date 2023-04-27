# Substrate to EVM example

This is an example react application to test the transfer of assets from Substrate to EVM. It was built primarily used with [sygma-relayer's local setup](https://github.com/sygmaprotocol/sygma-relayer/)

## Prerequisites

- [Yarn](https://yarnpkg.com/) (version 3.4.1 or higher)
- [Polkadot{.js} browser extension](https://polkadot.js.org/extension/)
- [Docker](https://www.docker.com/)

## Getting Started

### 0. Prepare local setup
Local setup is a docker configuration to run EVM and Substrate nodes as well as relayers on the local dev machine.
Make sure that you have latest installation of Docker and docker-compose.
Clone the repository of sygma-relayer and go to repository's directory.
```bash
git clone git@github.com:sygmaprotocol/sygma-relayer.git
cd sygma-relayer
```

You can build and run the local setup in a __quick way__ by running the following command:

```bash
# assuming that you are in the root directory of sygma-relayer
# it will build and start relayers: `docker-compose --file=./example/docker-compose.yml up --build`
make example
````
__Or__ you can build and run the local setup __manually__ by running the following commands:

```bash
# assuming that you are in the root directory of sygma-relayer
cd ./example
# Build the fresh docker images for relayers:
docker-compose build
# Finally we can start our nodes and relayers:
docker-compose up -d
````


### 1. Clone the repository

To get started, clone this repository to your local machine:

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

To start the example you need to build the sdk first:

```bash
yarn sdk:build
```

### 4. Start the development server

Change to `example/substrate-to-evm-react-example` and start the dev server

```bash
cd example/substrate-to-evm-react-example
yarn dev
```

Open browser on http://localhost:5173/

### 5. Usage

It is build to work with the wallet from polkadot js extension and the local setup of sygma-relayer.
- First you need to create a new account in the polkadot js extension
- After that you need to transfer to your account some native tokens from existing accounts. To do it consider cloning an running [polkadot.js.org/apps](https://github.com/polkadot-js/apps). You can use the `//Alice` or `//Bob` account to transfer some tokens to your new account.
- Then go to [assets page](http://localhost:3000/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/assets) in polkadotjs apps and mint some `USDC test asset` to your account.
- Now you can go to the [example app](http://localhost:5173) and transfer some assets from Substrate to EVM.



