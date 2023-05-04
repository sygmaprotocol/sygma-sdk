# ⚠️ This example is deprecated. Please look at docs for latest examples ⚠️
## Generic Colors App

## Setup

For you to run this example you need our local setup. Go to this [repo](https://github.com/sygmaprotocol/sygma-relayer) and make sure you have `golang` installed. Once you clone this repo, run the command `make example` and you will have two ganache nodes and three relayers with all the contracts deployed on each node

## Import private key to Metamask

To import the bridge account on metamask to use this app, use the following private key:

```bash
cc2c32b154490f09f70c1c8d4b997238448d649e0777495863db231c4ced3616
```

Address of the bridge admin is: `0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b`

## How to run this app

After you clone this repo run:

```bash
yarn # to install dependencies
cd ./examples/generic-colors
yarn setupColors # to setup some colors on the Colors contract that the example app uses
yarn start # start the frontend application
```

## Troubleshooting

A couple of important details:

- After deposit, update on the state for the app to show the new color in the destination chain will occur after 20 seconds. So, just wait to check the update on the state. This is because we need to wait some amount of time for the relayers to relay the message and the create the color on destinatio chain
- If you change networks with metamask, the app is going to be reloaded, but since this is using local nodes, metamask can keep the nonce count. If you try to start transfer, is going to fail because of incorrect nonce. Go to metamaks, click on `adavance` and the `reset account data` to reset nonce and use your account to start a transfer.