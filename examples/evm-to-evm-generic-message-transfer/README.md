<div align="center">
    <h1>Sygma SDK EVM - EVM Generic Message Transfer<img src="assets/logo.svg" alt="" height="26px"></h1>
</div>
<br>
<p align="center">
  <a href="https://github.com/sygmaprotocol/sygma-sdk/actions/workflows/ci.yaml">
    <img src="https://github.com/sygmaprotocol/sygma-sdk/actions/workflows/ci.yaml/badge.svg" alt="Build Status">
  </a>
    <img alt="GitHub" src="https://img.shields.io/github/license/sygmaprotocol/sygma-sdk">
  <a href="https://www.npmjs.com/package/@buildwithsygma/sygma-sdk-core">
</p>
<p align="center">
  <a href="https://docs.buildwithsygma.com/">Sygma general documentation</a>
</p>

An example demonstrating use of Sygma SDK v3 package to initiate a cross chain contract call.

## Setup

1. Create a `.env` file at the root of the project using the `.env.sample` file and set the following variables

   ```shell
   # Ethereum Private Key
   PRIVATE_KEY=""
   # Sepolia Chain RPC URL
   SEPOLIA_RPC_URL=""
   # "mainnet" or "testnet"
   SYGMA_ENV=""
   ```

2. Run `yarn run transfer` to initiate the example cross chain contract call.
