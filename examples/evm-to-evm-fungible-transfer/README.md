# EVM-to-EVM (Sepolia to Base Sepolia) token transfer example

In the following example, we will use the `TESTNET` environment to perform a cross-chain ERC-20 transfer with 5 `ERC20LRTST` tokens. The transfer will be initiated on the EVM-side via the Cronos testnet and received on the EVM-side via the Sepolia Ethereum testnet.

This is an example script that demonstrates the functionality of the Sygma SDK and the wider Sygma ecosystem of relayers and bridge and handler contracts. The complete example can be found in this [repo](
https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-evm-fungible-transfer).

### Prerequisites

Before running the script, ensure that you have the following:

- Node.js v18
- Yarn (version 3.4.1 or higher)
- The [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) of your development wallet
- Testnet [CRO](https://docs.cronos.org/for-users/testnet-faucet) for gas
- An Ethereum [provider](https://www.infura.io/) (in case the hardcoded RPC within the script does not work)
- A development wallet funded with `ERC20LRTest` tokens from the [Sygma faucet](https://faucet-ui-stage.buildwithsygma.com/) (you can use the UI below; please allow some time for minting as testnet may be congested)

import App from '../../../../src/Faucet/App';

<App />
<br/>

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

The example will use `ethers` in conjunction with the sygma-sdk to create a transfer from Cronos to Sepolia with the `ERC20LRTST` token. It will be received on Sepolia as the `ERC20LRTST` token.

## Script functionality

This example script performs a cross-chain ERC-20 token transfer using the Sygma SDK. The transfer starts on one EVM chain (e.g., Cronos or Sepolia) and is received on another EVM chain (e.g., Sepolia or BASE). Here’s how the script works:

### 1.	Imports the Required Packages:
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
Constants like SEPOLIA_CHAIN_ID, RESOURCE_ID, and CRONOS_RPC_URL are defined based on the specific environment you are working in.
```ts
const SEPOLIA_CHAIN_ID = 11155111;
const BASE_SEPOLIA_CHAIN_ID = 84532;
const RESOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000001200";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/MeCKDrpxLkGOn4LMlBa3cKy1EzzOzwzG";
```

### 2. Configures dotenv Module:
The script loads environment variables using the dotenv module. This includes sensitive information like your private key, which should be stored in a .env file for security purposes.

```ts
import dotenv from "dotenv";

dotenv.config()

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}
```

The PRIVATE_KEY environment variable is critical for signing transactions with your Ethereum wallet.

### 3.	Defines the Transfer Function:
The erc20Transfer function is the main function that handles the token transfer. It initializes the provider and wallet, sets up the asset transfer, and constructs the transfer object.
```ts
export async function erc20Transfer(): Promise<void> {}
```

### 4. Sets Up the Provider and Wallet:

The script sets up a Web3 provider and creates a wallet using the provided private key. In this case, the script is interacting with the Sepolia network.

```ts
const provider = new providers.JsonRpcProvider(CRONOS_RPC_URL);
const wallet = new Wallet(privateKey ?? "", provider);
```

### 5. Initializes the Asset Transfer Object:
The Sygma SDK’s EVMAssetTransfer object is initialized using the TESTNET environment. This object is used to build and manage the cross-chain ERC-20 transfer.
```ts
const assetTransfer = new EVMAssetTransfer();
await assetTransfer.init(provider, Environment.TESTNET);
```
### 6.	Constructs the Transfer Object:
The script constructs a transfer object using the sender’s address, recipient’s address (same in this case but on a different chain), and the amount to be transferred (5 tokens, represented with 18 decimal places).

```ts
  const transfer = assetTransfer.createFungibleTransfer(
    await wallet.getAddress(),
    SEPOLIA_CHAIN_ID,
    await wallet.getAddress(), // Sending to the same address on a different chain
    RESOURCE_ID,
    "5000000000000000000" // 18 decimal places, so in this case, 5 tokens would be sent
  );
```

### 7.	Builds and Sends Approval Transactions:
Before the actual transfer, approval transactions must be sent to authorize the transfer of ERC-20 tokens. The script iterates over the approval transactions, sends them, and logs their transaction hashes.
```ts
const approvals = await transfer.getApprovalTransactions();
console.log(`Approving Tokens (${approvals.length})...`);
for (const approval of approvals) {
    const response = await wallet.sendTransaction(approval);
    await response.wait();
    console.log(
        `Approved, transaction: ${getTxExplorerUrl({txHash: response.hash, chainId: SEPOLIA_CHAIN_ID})}`
    );
}
```


### 8. Builds and Sends the Final Transfer Transaction:
After approval, the script builds the transfer transaction and sends it to the Ethereum network. Once the transaction is sent, it logs the transaction hash.
```ts
  const transferTx = await transfer.getTransferTransaction();
  const response = await wallet.sendTransaction(transferTx);
  await response.wait();
console.log(
    `Depositted, transaction:  ${getSygmaScanLink(response.hash, process.env.SYGMA_ENV)}`
);
```

### 9. Call the method
Call the described method above
```ts
erc20Transfer().finally(() => {});
```
