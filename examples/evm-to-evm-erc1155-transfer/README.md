
# Sygma SDK ERC1155 Non-Fungible Token Transfer Example

This example script demonstrates how to perform a **non-fungible ERC1155 token transfer** between two accounts on different testnets using the Sygma SDK.

## Prerequisites

Before running the script, ensure that you have the following:

- **Node.js** 18+ installed on your machine.
- **Yarn** (version 3.4.1 or higher).
- The [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) of your development wallet.
- **Sepolia ETH** for gas fees, obtainable from [Sepolia Faucet](https://sepoliafaucet.com/).
- An Ethereum **provider URL** (e.g., from [Infura](https://www.infura.io/) or [Alchemy](https://www.alchemy.com/)).  (in case the hardcoded RPC within the script does not work)
- An **ERC1155 non-fungible token** deployed on the source network.
- The [**resource ID**](https://docs.buildwithsygma.com/resources/environments/testnet/#registered-resources) corresponding to your ERC1155 token registered with the Sygma protocol.

## Getting Started

### 1. Clone the Repository

To get started, clone the Sygma SDK repository to your local machine:

```bash
git clone git@github.com:sygmaprotocol/sygma-sdk.git
cd sygma-sdk/
```

### 2. Install Dependencies

Install the project dependencies by running:

```bash
yarn install
```

### 3. Build the SDK

To build the SDK, run:

```bash
yarn build:all
```

## Usage

This example uses the `dotenv` module to manage private keys and environment variables. Before running the example, you need to set up your environment variables, including your wallet's private key, the token ID, and other necessary information.

**⚠️ WARNING: DO NOT COMMIT PRIVATE KEYS WITH REAL FUNDS TO GITHUB OR ANY PUBLIC REPOSITORY. DOING SO COULD RESULT IN COMPLETE LOSS OF YOUR FUNDS.**

### 1. Set Up Environment Variables

Create a `.env` file in the `examples/erc1155-non-fungible-transfer` directory:

```bash
cd examples/erc1155-non-fungible-transfer
touch .env
```

Use the provided `.env.sample` as a template. Replace the placeholder values with your own:

- `PRIVATE_KEY`: Your wallet's private key.
- `TOKEN_ID`: The ID of the ERC1155 token you wish to transfer.
- `SYGMA_ENV`: The Sygma environment you're using (e.g., `testnet` or `mainnet`).
- `SEPOLIA_RPC_URL`: (Optional) Custom RPC URL for the Sepolia network.
- `CRONOS_RPC_URL`: (Optional) Custom RPC URL for the Cronos testnet.

Example `.env` file:

```env
PRIVATE_KEY="your_private_key_here"
TOKEN_ID="1"
SYGMA_ENV="testnet"
SEPOLIA_RPC_URL="https://your-sepolia-rpc-url"
CRONOS_RPC_URL="https://your-cronos-rpc-url"
```

### 2. Run the ERC1155 Non-Fungible Token Transfer Script

To execute the ERC1155 transfer script, run:

```bash
yarn run transfer
```

This command will execute the script located in `examples/erc1155-non-fungible-transfer/erc1155NonFungibleTransfer.ts`.

## Script Functionality

The example script performs the following steps:

1. **Initialize the SDK and Ethereum Provider**: Sets up the Sygma SDK and connects to the Ethereum provider to interact with the blockchain.

2. **Retrieve Supported Domains and Resources**: Fetches the list of supported domains and resources from the SDK configuration to ensure the networks and tokens involved are supported.

3. **Set Up Transfer Parameters**: Defines the details of the ERC1155 non-fungible token transfer, including source and destination chain IDs, resource ID, token ID, and recipient address.

4. **Create the Transfer Object**: Uses the SDK to create a transfer object that encapsulates the transfer details and logic.

5. **Check for Required Approvals**: Builds the necessary approval transactions to authorize the bridge contract to transfer your ERC1155 token. It checks if approvals are already in place to avoid redundant transactions.

6. **Send Approval Transactions**: Sends any required approval transactions using your Ethereum wallet.

7. **Retrieve Transfer Fee**: Fetches the fee required for the transfer from the SDK. This fee may vary depending on the networks and token involved.

8. **Build and Send the Transfer Transaction**: Constructs the final transfer transaction using the SDK and sends it using your Ethereum wallet.

9. **Monitor Transfer Progress**: Logs transaction hashes and provides links to blockchain explorers and SygmaScan to monitor the transfer status.

## Notes

- **ERC1155 Non-Fungible Tokens**: This script is specifically designed for ERC1155 tokens that represent non-fungible assets (unique items). Ensure that the `TOKEN_ID` you provide corresponds to a non-fungible token with a balance of `1` in your wallet.

- **Sygma Environment**: The `SYGMA_ENV` variable should match the environment your resources are registered in (e.g., `testnet` or `mainnet`).

- **Custom RPC URLs**: If you encounter issues with the default RPC URLs, you can specify custom URLs using environment variables like `SEPOLIA_RPC_URL` and `CRONOS_RPC_URL`.

- **Gas Fees**: Ensure your wallet has sufficient ETH on the source network to cover gas fees for transactions.

## Example Script Breakdown

The script (`erc1155NonFungibleTransfer.ts`) performs the following actions:

### **Imports Required Modules and Configurations**

```typescript
import {
  Eip1193Provider,
  Environment,
  getSygmaScanLink,
} from '@buildwithsygma/core';
import {
  createErc1155NonFungibleAssetTransfer,
  EvmAssetTransferParams,
} from '@buildwithsygma/evm';
import dotenv from 'dotenv';
import { Wallet, providers } from 'ethers';
import Web3HttpProvider from 'web3-providers-http';
```

### **Loads Environment Variables**

```typescript
dotenv.config();
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('Missing environment variable: PRIVATE_KEY');
}
```

### **Sets Up Network and Resource Configurations**

```typescript
const SEPOLIA_CHAIN_ID = 11155111;
const CRONOS_TESTNET_CHAIN_ID = 338;
const RESOURCE_ID = '0x...'; // Replace with your ERC1155 resource ID
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://default-sepolia-rpc-url';
const CRONOS_RPC_URL = process.env.CRONOS_RPC_URL || 'https://default-cronos-rpc-url';
```

### **Initializes Providers and Wallets**

```typescript
const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
const wallet = new Wallet(privateKey, ethersWeb3Provider);
const sourceAddress = await wallet.getAddress();
const destinationAddress = '0xRecipientAddress'; // Replace with the actual recipient address
```

### **Defines Transfer Parameters**

```typescript
const params: EvmAssetTransferParams = {
  source: SEPOLIA_CHAIN_ID,
  destination: CRONOS_TESTNET_CHAIN_ID,
  sourceNetworkProvider: web3Provider as unknown as Eip1193Provider,
  resource: RESOURCE_ID,
  tokenId: process.env.TOKEN_ID as string,
  amount: BigInt(1), // Amount is always 1 for non-fungible tokens
  recipientAddress: destinationAddress,
  sourceAddress,
};
```

### **Creates the Transfer Object**

```typescript
const transfer = await createErc1155NonFungibleAssetTransfer(params);
```

### **Handles Approval Transactions**

```typescript
const approvals = await transfer.getApprovalTransactions();
console.log(`Approving Tokens (${approvals.length})...`);
for (const approval of approvals) {
  const response = await wallet.sendTransaction(approval);
  await response.wait();
  console.log(`Approved, transaction: ${response.hash}`);
}
```

### **Builds and Sends the Transfer Transaction**

```typescript
const transferTx = await transfer.getTransferTransaction();
const response = await wallet.sendTransaction(transferTx);
await response.wait();
console.log(`Deposited, transaction: ${getSygmaScanLink(response.hash, process.env.SYGMA_ENV as Environment)}`);
```

### **Error Handling**

```typescript
erc1155NonFungibleTransfer().catch((error) => {
  console.error('Error during ERC1155 non-fungible transfer:', error);
});
```

## Additional Information

- **Security**: Keep your private keys secure. Never share them or commit them to version control systems.

- **Resource Registration**: Before running the script, ensure that your ERC1155 token and its corresponding resource ID are registered with the Sygma protocol.

- **Troubleshooting**: If you encounter errors, check the console output for detailed error messages. Common issues include insufficient balance, incorrect token ID, or missing approvals.

## Support

If you have any questions or need assistance, please refer to the [Sygma SDK documentation](https://docs.buildwithsygma.com/) or reach out to the Sygma community.

