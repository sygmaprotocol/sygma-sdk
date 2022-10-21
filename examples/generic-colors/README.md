# Generic Colors App

## Setup

For you to run this example you need our local setup. Go to this [repo](https://github.com/sygmaprotocol/sygma-relayer) and make sure you have `golang` installed. Once you clone this repo, run the command `make example` and you will have two ganache nodes and three relayers with all the contracts deployed on each node

## How to run this app

After you clone this repo run:

```bash
yarn # to install dependencies
cd ./examples/generic-colors
yarn setupColors # to setup some colors on the Colors contract that the example app uses
yarn start # start the frontend application
```