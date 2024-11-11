# EVM-to-EVM (Sepolia to Base Sepolia) token transfer example

In the following example, we will use the `TESTNET` environment to perform a cross-chain ERC-20 transfer with 1 testnet `USDC` tokens. The transfer will be initiated on the EVM-side via the Ethereum Sepolia testnet and received on Base Sepolia testnet.

This is an example script that demonstrates the functionality of the Sygma SDK and the wider Sygma ecosystem of relayers and bridge and handler contracts. The complete example can be found in this [repo](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-evm-fungible-transfer).

### Prerequisites

Before running the script, ensure that you have the following:

- Node.js v18
- Yarn (version 3.4.1 or higher)
- The [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) of your development wallet
- Testnet [ETH](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) for gas
- An Ethereum [provider](https://www.infura.io/) (in case the hardcoded RPC within the script does not work)
- A development wallet funded with `USDC` tokens from the [USDC Faucet](https://faucet.circle.com)

:::danger
We make use of the dotenv module to manage exported private keys with environment variables. Please note that accidentally committing a .env file containing private keys to a wallet with real funds, onto GitHub, could result in the complete loss of your funds. **Never expose your private keys.**
:::

### Getting started

1. Clone the repository

Clone the sygma-sdk repository into a directory of your choice, and then `cd` into the folder:

```bash
git clone https://github.com/sygmaprotocol/sygma-sdk.git
cd sygma-sdk/
```

2. Install dependencies

Install the project dependencies by running:

```bash
yarn install
```

3. Build the SDK

Build the SDK by running the following command:

```bash
yarn build
```

4. Usage

This example uses the `dotenv` module to manage private keys. To run the example, you will need to configure your environment variable to include your test development account's [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key). A `.env.sample` is provided as a template.

**DO NOT COMMIT PRIVATE KEYS WITH REAL FUNDS TO GITHUB. DOING SO COULD RESULT IN COMPLETE LOSS OF YOUR FUNDS.**

Create a `.env` file in the evm-to-evm example folder:

```bash
cd examples/evm-to-evm-fungible-transfer
touch .env
```

Replace between the quotation marks your exported private key:

```dotenv
PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"
```

To send an ERC-20 example transfer from EVM to EVM, run:

```bash
cd examples/evm-to-evm-fungible-transfer
yarn run transfer
```

The example will use `ethers` in conjunction with the sygma-sdk to create a transfer from Sepolia to Base Sepolia with the `USDC` token. It will be received on Sepolia as the `USDC` token.

## Script functionality

This example script performs a cross-chain ERC-20 token transfer using the Sygma SDK. The transfer starts on one EVM chain (e.g., Sepolia) and is received on another EVM chain (e.g., BASE). Here’s how the script works:

### 1. Imports the Required Packages:

The script first imports all the necessary modules, including those from the Sygma SDK (for asset transfer) and ethers.js (for interacting with Ethereum wallets and providers).

```ts
import { getSygmaScanLink, type Eip1193Provider } from "@buildwithsygma/core";
import {
  createFungibleAssetTransfer,
  FungibleTransferParams,
} from "@buildwithsygma/evm";
import dotenv from "dotenv";
import { Wallet, providers } from "ethers";
import Web3HttpProvider from "web3-providers-http";
```

Constants like `SEPOLIA_CHAIN_ID`, `RESOURCE_ID`, and `BASE_SEPOLIA_CHAIN_ID` are defined based on the specific environment you are working in.

```ts
const SEPOLIA_CHAIN_ID = 11155111;
const BASE_SEPOLIA_CHAIN_ID = 84532;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001200";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
```

### 2. Configures dotenv Module:

The script loads environment variables using the dotenv module. This includes sensitive information like your private key, which should be stored in a .env file for security purposes.

```ts
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}
```

The PRIVATE_KEY environment variable is critical for signing transactions with your Ethereum wallet.

### 3. Defines the Transfer Function:

The erc20Transfer function is the main function that handles the token transfer. It initializes the provider and wallet, sets up the asset transfer, and constructs the transfer object.

```ts
export async function erc20Transfer(): Promise<void> {}
```

### 4. Sets Up the Provider and Wallet:

The script sets up a Web3 provider and creates a wallet using the provided private key. In this case, the script is interacting with the Sepolia network.

```ts
const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
const wallet = new Wallet(privateKey ?? "", ethersWeb3Provider);
const sourceAddress = await wallet.getAddress();
const destinationAddress = await wallet.getAddress();
```

### 5. Initializes the Asset Transfer Object:

The Sygma SDK’s EVM Asset Transfer object is initialized using the TESTNET environment. This object is used to build and manage the cross-chain ERC-20 transfer. The script constructs a transfer object using the sender’s address, recipient’s address (same in this case but on a different chain), and the amount to be transferred (1 token, represented with 6 decimal places).

```ts
const params: FungibleTransferParams = {
  source: SEPOLIA_CHAIN_ID,
  destination: BASE_SEPOLIA_CHAIN_ID,
  sourceNetworkProvider: web3Provider as unknown as Eip1193Provider,
  resource: RESOURCE_ID,
  amount: BigInt(1) * BigInt(1e6),
  recipientAddress: destinationAddress,
  sourceAddress: sourceAddress,
};

const transfer = await createFungibleAssetTransfer(params);
```

### 6. Builds and Sends Approval Transactions:

Before the actual transfer, approval transactions must be sent to authorize the transfer of ERC-20 tokens. The script iterates over the approval transactions, sends them, and logs their transaction hashes.

```ts
const approvals = await transfer.getApprovalTransactions();
for (const approval of approvals) {
  const response = await wallet.sendTransaction(approval);
  await response.wait();
}
```

### 7. Builds and Sends the Final Transfer Transaction:

After approval, the script builds the transfer transaction and sends it to the Ethereum network. Once the transaction is sent, it logs the transaction hash.

```ts
const transferTx = await transfer.getTransferTransaction();
const response = await wallet.sendTransaction(transferTx);
await response.wait();
```

### 9. Call the method

Call the described method above

```ts
erc20Transfer().finally(() => {});
```
