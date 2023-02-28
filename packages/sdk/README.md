# Sygma SDK

Core primitives for cross-chain comunication between EVM compatible networks.

## Getting started

```ts
import { Sygma } from "@buildwithsygma/sygma-sdk-core";

// Addresses come from Sygma local setup
const bridgeSetupList: SygmaBridgeSetupList = [
  {
    domainId: "1",
    networkId: 1337,
    name: "Local EVM 1",
    decimals: 18,
    bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
    erc20HandlerAddress: "0x1ED1d77911944622FCcDDEad8A731fd77E94173e",
    erc721HandlerAddress: "0x481f97f9C82a971B3844a422936a4d3c4082bF84",
    rpcUrl: "http://localhost:8545",
    tokens: [
      {
        type: "erc20",
        address: "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A",
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
        },
      },
    ],
  },
  {
    domainId: "2",
    networkId: 1338,
    name: "Local EVM 2",
    decimals: 18,
    bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
    erc20HandlerAddress: "0x1ED1d77911944622FCcDDEad8A731fd77E94173e",
    erc721HandlerAddress: "0x481f97f9C82a971B3844a422936a4d3c4082bF84",
    rpcUrl: "http://localhost:8547",
    tokens: [
      {
        type: "erc20",
        address: "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A",
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
        },
      },
    ],
  },
];

// Test account from Sygma local setup
const acc = '0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b'

const sygma = new Sygma({ bridgeSetupList })

// Asuming that context of execution is NodeJS
const bridgeEvents = sygma.initializeConnectionRPC(acc)

// Getting basic fee
const basicFee = await sygma.fetchBasicFeeData({
  amount: "1",
  recipientAddress: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
})

console.log("Basic fee is:", basicFee.feeData)

// Making a deposit. Approve first
const approvalTxReceipt = await sygma.approve({
  amountOrIdForApproval: "1",
})

const txReceipt = await approvalTxReceipt.wait(1)

console.log("tx receipt status", txReceipt.status)

// Make the deposit
const deposit = await sygma.deposit({
  amount: "1",
  recipientAddress: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
  feeData: basicFee
})

const txReceiptDeposit = await deposit.wait(1)

console.log("Tx receipt deposit:", txReceiptDeposit.status)

// Getting deposit nonce

const depositEvent = await sygma.getDepositEventFromReceipt(txReceiptDeposit)
const { depositNonce } = depositEvent.args;
console.log("Deposit Nonce:", depositNonce)

// Check the logs on your local setup
```

### Other useful methods are:

```ts
const hasTokenSupplies = await sygma.hasTokenSupplies(
  10
) // true \\ false

const checkCurrentAllowance = await sygma.checkCurrentAllowance("0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b") // BigNumber

const getTokenInfo = await sygma.getTokenInfo("chain1") // { balanceOfTokens: BigNumber, tokenName: string }

// Check approval for tokenID of selected ERC721
const isApproved = await sygma.getAppoved(123)
```
