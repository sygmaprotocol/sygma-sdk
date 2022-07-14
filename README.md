<p align="center"><a href="https://https://chainsafe.io/"><img width="250" title="Chainbridge UI" src='assets/chainsafe_logo.png'/></a></p>

# Sygma SDK

## Introduction
**Sygma SDK** is an OpenSource (under GNU Lesser General Public License v3.0) SDK for developers
to work with Chainsafe [Chainbridge Hub](https://github.com/ChainSafe/chainbridge-core). SDK consist of methods for accomplish bridging capabilities between Ethereum networks.

***NOTE*** this is under an active development so can be broken occasionally.

The current SDK has one package that comprises the whole bridging logic for transferring ERC20 tokens between Ethereum networks. Alongside with this we have two folder examples that demonstrate the usage of our SDK. If you want to run the examples alongside our bridging infrastructure, please make sure you have [Chainbridge](https://github.com/ChainSafe/chainbridge-core) in order for you to run `make local-setup` command.

## Usefull commands.

After cloning the repo, simply run

```bash
npx lerna bootstrap
```

## Running the Examples

For React example, after you have run and deploy the contracts using [Chainbridge](https://github.com/ChainSafe/chainbridge-core), go to the `examples` folder and simply run

```bash
yarn start
```

For NodeJS example, simply run:

```bash
yarn run:local-ex
```

# How to use it

## Environment

In order for you to use our SDK you need to have installed on your local machine [chainbridge-hub](https://github.com/ChainSafe/chainbridge-hub) repo. The main dependency to run `chainbridge-hub` is to have `go` installed in your machine. After that follow the instructions to run the local example. Is going to take a couple of minutes for all the setup to be completed. If you want to check the logs of the deployed contracts you can do the following:

```bash
# inside the root directory of chainbrdige-hub
cd example
docker-compose -f ./docker-compose.yml logs setup
```

You should see something like this:

```bash
setup       | ===============================================
setup       | 🎉🎉🎉 ChainBridge Successfully Deployed 🎉🎉🎉
setup       |
setup       | - Chain 1 -
setup       | Bridge: 0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66
setup       | Fee Handler: 0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69 (is basic fee handler: true, fee amount: 100000000000 wei)
setup       | ERC20: 0xb83065680e6AEc805774d8545516dF4e936F0dC0
setup       | ERC20 Handler: 0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e
setup       | ERC721: 0x05C5AFACf64A6082D4933752FfB447AED63581b1
setup       | ERC721 Handler: 0x75dF75bcdCa8eA2360c562b4aaDBAF3dfAf5b19b
setup       | Generic Handler: 0xe1588E2c6a002AE93AeD325A910Ed30961874109
setup       | Asset Store: 0x7573B1c6de00a73e98CDac5Cd2c4a252BdC87600
setup       | ERC20 resourceId:
setup       | ERC721 resourceId:
setup       | Generic resourceId:
setup       |
setup       | - Chain 2 -
setup       | Bridge: 0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66
setup       | Fee Handler: 0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69 (is basic fee handler: true, fee amount: 100000000000 wei)
setup       | ERC20: 0xb83065680e6AEc805774d8545516dF4e936F0dC0
setup       | ERC20 Handler: 0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e
setup       | ERC721: 0x05C5AFACf64A6082D4933752FfB447AED63581b1
setup       | ERC721 Handler: 0x75dF75bcdCa8eA2360c562b4aaDBAF3dfAf5b19b
setup       | Generic Handler: 0xe1588E2c6a002AE93AeD325A910Ed30961874109
setup       | Asset Store: 0x7573B1c6de00a73e98CDac5Cd2c4a252BdC87600
setup       | ERC20 resourceId:
setup       | ERC721 resourceId:
setup       | Generic resourceId:
setup       |
setup       | ===============================================
```

With this addresses you can use our SDK with the `basic fee` setup.

## Checking the examples folder

There is a folder with examples ready to be used for the SDK. Currently we have two working with our current local setup. If you decide that is not for you, here is a little guide to get you started with our SDK.

## How to use it from NodeJS

Assuming you are going to use the local setup provider by [chainbridge-hub](https://github.com/ChainSafe/chainbridge-hub), the setup that you need to pass to the `Chainbrdige` class is going to have the following structure:

```ts
import { Sygma } from "@chainsafe/chainbridge-sdk-core";

const bridgeSetup: BridgeData = {
  chain1: {
      bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
      erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
      erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
      feeHandlerAddress: "0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69",
      rpcURL: "http://localhost:8545",
      domainId: "1",
      erc20ResourceID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      decimals: 18
    },
    chain2: {
      bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
      erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
      erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
      feeHandlerAddress: "0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69",
      rpcURL: "http://localhost:8547",
      domainId: "2",
      erc20ResourceID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      decimals: 18
    },
}
```

We are going to use the SDK with `NodeJS` so, you we are going to use one of the testing accounts from the local setup:

```ts
 const testAcc = "0xF4314cb9046bECe6AA54bb9533155434d0c76909";
```

Then we create a `setup` object to pass to the `Chainbridge` class:

```ts
const setup = { bridgeSetup }

const chainbridge = new Sygma(setup)
```

Now we are ready to initialize connection:

```ts
const bridgeEvents = sygma.initializeConnectionRPC(testAcc)
```

With this we can get the basicFee rate to use in our first deposit:

```ts
const basicFeeRate = await sygma.fetchFeeData({
  amount: "1",
  recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
  from: "chain1",
  to: "chain2"
})
```

Once this, we can approve the amounts of tokens to transfer before we made the deposit:

```ts
const approvalTxReceipt = await (await sygma.approve({
  amountForApproval: "1",
  from: "chain1"
})).wait(1)

const deposit = await sygma.deposit({
  amount: "1",
  recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
  from: "chain1",
  to: "chain2",
  feeData: basicFee.feeData
})

const txReceipt = await deposit.wait(1)
```

After that, you can watch the logs an see your funds being transfer from one of the networks to the other.


## Support
<a href="https://discord.gg/ykXsJKfhgq">
  <img alt="discord" src="https://img.shields.io/discord/593655374469660673?label=Discord&logo=discord&style=flat" />
</a>

## License
GNU Lesser General Public License v3.0
