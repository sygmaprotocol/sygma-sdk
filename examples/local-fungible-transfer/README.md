## Sygma SDK Local Example

This is an example script that demonstrates the functionality of the SDK using the Sygma ecosystem.
The script showcases fungible token transfer between two networks using the Sygma SDK.

This example is prepared to work with [Sygma local setup](https://docs.buildwithsygma.com/sdk/advanced/localsetup) that can be found inside [relayer repository](https://github.com/sygmaprotocol/sygma-relayer).

## Prerequisites

Before running the script, ensure that you have the following:

- Node.js installed on your machine
- [Yarn](https://yarnpkg.com/) (version 3.4.1 or higher)

## Getting started

### 1. Run local setup:

#### Clone relayers repository

First, clone the Sygma relayer repository to your local machine with:

```
git clone https://github.com/sygmaprotocol/sygma-relayer.git
```

#### Start local setup

This will start the dockerized setup:

```
make example
```

### 2. Clone the repository

Clone this repository to your local machine with:

```bash
git clone git@github.com:sygmaprotocol/sygma-sdk.git
cd sygma-sdk/
```

### 3. Install dependencies

Install the project dependencies by running:

```bash
yarn install
```

### 4. Build the sdk

To start the example you need to build the sdk first with:

```bash
yarn sdk:build
```

## 5. Usage

To send a ERC20 example transfer run:

```bash
yarn run transfer:evm-substrate
```

This example will use `ethers` in conjuction with the sygma-sdk to
create a transfer from `EVM1` to `Substrate` network.

You can also run:

```bash
yarn run transfer:substrate-evm
```

Similarly, this example will use `@polkadot/api` in conjuction with the sygma-sdk to
create a transfer from `Substrate` to `EVM1` network.


For more details check out documentation on [Sygma local setup](https://docs.buildwithsygma.com/sdk/advanced/localsetup).
