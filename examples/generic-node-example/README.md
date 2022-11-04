# Generic Colors Node.js example

## Setup

For you to run this example you need our local setup. Go to this [repo](https://github.com/sygmaprotocol/sygma-relayer) and make sure you have `golang` installed. Once you clone this repo, run the command `make example` and you will have two ganache nodes and three relayers with all the contracts deployed on each node

## How to run this example

After you clone this repo run. The transfer is from Ganache node on port `8545` to port `8547`

```bash
yarn # to install dependencies
cd ./examples/generic-node-example
yarn setupColors # to setup some colors on the Colors
yarn depositGeneric # run the script that takes care of the generic transfer
```
