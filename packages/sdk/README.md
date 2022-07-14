<p align="center"><a href="https://https://chainsafe.io/"><img width="250" title="Chainbridge UI" src='../../assets/chainsafe_logo.png'/></a></p>

# Sygma SDK

Core primitives for cross-chain comunication between EVM compatible networks.

## Getting started

```ts
import { Sygma } from "@chainsafe/chainbridge-sdk-core";

// Addresses come from Chainbridge-hub local setup
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

// Test account from Chainbridge-hub local setup
const acc = '0xF4314cb9046bECe6AA54bb9533155434d0c76909'

const sygma = new Sygma({ bridgeSetup })

// Asuming that context of execution is NodeJS
const bridgeEvents = sygma.initializeConnectionRPC(acc)

// Getting basic fee
const basicFeeRate = await sygma.fetchFeeData({
  amount: "1",
  recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
  from: "chain1",
  to: "chain2"
})

console.log("Basic fee is:", basicFeeRate.feeData)

// Making a deposit. Approve first
const approvalTxReceipt = await sygma.approve({
  amountForApproval: "1",
  from: "chain1"
})

const txReceipt = await approvalTxReceipt.wait(1)

console.log("tx receipt status", txReceipt.status)

// Make the deposit
const deposit = await sygma.deposit({
  amount: "1",
  recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
  from: "chain1",
  to: "chain2",
  feeData: basicFee.feeData
})

const txReceiptDeposit = await deposit.wait(1)

console.log("Tx receipt deposit:", txReceiptDeposit.status)

// Check the logs on your local setup
```

### Other useful methods are:

```ts
const hasTokenSupplies = await sygma.hasTokenSupplies(
  10, "chain1"
) // true \\ false

const checkCurrentAllowance = await sygma.checkCurrentAllowance("chain1", "0xF4314cb9046bECe6AA54bb9533155434d0c76909") // BigNumber

const getTokenInfo = await sygma.getTokenInfo("chain1") // { balanceOfTokens: BigNumber, tokenName: string }
```
