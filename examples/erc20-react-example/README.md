<p align="center"><a href="https://https://chainsafe.io/"><img width="250" title="Chainbridge UI" src='../../assets/full-logo.png'/></a></p>
# ⚠️ This example is deprecated. Please use [EVM to Substrate example](../evm-to-substrate-react-example/) instead ⚠️
## Sygma SDK ERC20 React Example
<p align="center">
<img widht="700" src='./public/erc20-example-screen.png' alt="screen" />
</p>

This simple React application demonstrate the usage of our SDK methods, alongside with the [Sygma](https://github.com/sygmaprotocol/sygma-relayer) local setup.

### Getting started
#### Installing and building sdk
Before running the erc20 example you need to clone the repo and then install dependencies:

```bash
git clone git@github.com:sygmaprotocol/sygma-sdk.git
cd sygma-sdk
yarn
```

then compile sdk with following command:
```bash
# from the repository root
cd ./packages/sdk
yarn tsc
```


#### Local setup
To run our local setup please follow insturctions in [sygma-relayer repo](https://github.com/sygmaprotocol/sygma-relayer#local-environment)

In the end you should have 2 geth nodes running on `localhost:8545` and `localhost:8547` and two relayers running

### Running the react app
first change directory to erc20 directory:

```bash
# from the repository root
cd examples/erc20-react-example
```

Mint 99 ERC20 token for test:
```bash
# from examples/erc20-react-example
yarn mintERC20
```
Please add private key `0xcc2c32b154490f09f70c1c8d4b997238448d649e0777495863db231c4ced3616`
and erc20 token `0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A` to metamask
<p align="center">
<img widht="200" src='./public/metamask0.png' alt="screen" />
<img widht="200" src='./public/metamask2.png' alt="screen" />

</p>


run the command to start the app:
```bash
# from examples/erc20-react-example
yarn start
```
and then you can open your browser on http://localhost:3001


