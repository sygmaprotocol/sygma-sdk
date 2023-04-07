# EVM to Substrate example

This is an example react application to test the transfer of ERC20 from EVM to Substrate. It was built primarily used with [sygma-relayer's local setup](https://github.com/sygmaprotocol/sygma-relayer/)

## Prerequisites

- [Yarn](https://yarnpkg.com/) (version 3.4.1 or higher)
- [MetaMask](https://metamask.io/)
- [Docker](https://www.docker.com/)

## Getting Started

### 0. Prepare local setup
Local setup is a docker configuration to run EVM and Substrate nodes as well as relayers on the local dev machine.
Make sure that you have latest installation of Docker and docker-compose.
Clone the repository of sygma-relayer and got to example directory:
```bash
git clone git@github.com:sygmaprotocol/sygma-relayer.git
cd sygma-relayer/example
```

Now we need to build the fresh docker images for relayers:

```bash
docker-compose build
```

Finally we can start our nodes and relayers:

```bash
docker-compose up -d
```


### 1. Clone the repository

To get started, clone this repository to your local machine:

```bash
git clone git@github.com:sygmaprotocol/sygma-sdk.git
cd sygma-sdk/examples/evm-to-substrate-example
```

### 2. Install dependencies

Install the project dependencies by running:

```bash
yarn install
```


### 3. Start the development server

```bash
yarn dev
```

Open browser on http://localhost:5174/

### 4. Use our test ethereum account

Import private key of our test account and to be able to use premined ERC20 tokens

```bash
0xcc2c32b154490f09f70c1c8d4b997238448d649e0777495863db231c4ced3616
```

And connect this account with address `0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b`to the example application

Don't forget to reset account(Settings -> Advanced -> Reset account) in MetaMask every time you restart the local nodes to avoid transaction nonce errors.

