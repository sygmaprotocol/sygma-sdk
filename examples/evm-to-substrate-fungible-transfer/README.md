# EVM to Substrate (Sepolia to Tangle) Token Transfer Example

The following example demonstrates how to use the Sygma SDK to transfer ERC-20 tokens from an EVM chain (in this case, Sepolia) to a Substrate chain (Tangle) using the SDK’s functionalities and Ethereum’s ethers.js library.

In the following example, we will use the `TESTNET` environment to perform a cross-chain ERC-20 transfer with 0.5 Sepolia sygUSD `sygUSD` tokens. The transfer will be initiated on the EVM-side via the Sepolia Ethereum testnet and received on the Substrate-side via the Rococo-Phala testnet.

This is an example script that demonstrates the functionality of the Sygma SDK and the wider Sygma ecosystem of relayers and bridge and handler contracts/pallets. The complete example can be found in this [repo](
https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples/evm-to-substrate-fungible-transfer#sygma-sdk-erc20-example).

### Prerequisites

Before running the script, ensure that you have the following:

- Node.js installed on your machine (v18.20.4)
- Yarn (version 4 or higher)
- The [exported private key](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) of your development wallet
- A Substrate wallet to receive tokens into (the example presets an existing wallet address already)
- [Sepolia ETH](https://sepoliafaucet.com/) for gas
- An Ethereum [provider](https://www.infura.io/) (in case the hardcoded RPC within the script does not work)
- A development wallet funded with `sygUSD` tokens from the [Sygma faucet](https://faucet-ui-stage.buildwithsygma.com/)

import App from '../../../../src/Faucet/App';

<App />
<br/>

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

:::danger Important Security Notice
This example uses the dotenv module to manage sensitive information like private keys. Never expose your private keys or commit them to public repositories. Doing so could lead to the loss of all your funds. Make sure you handle private keys with care and follow best practices for security.
:::

This script relies on the dotenv module to securely manage your private keys via environment variables. To run the example, you need to configure the environment variables for your test development account’s exported private key. A .env.sample file is provided as a template for you to create and manage these variables.

### Steps to Set Up Environment Variables

1.	Create a .env file in the evm-to-substrate-fungible-transfer example folder:

```bash
cd examples/evm-to-substrate-fungible-transfer
touch .env
```
2. Add your exported private key to the .env file. Replace the placeholder text with your actual private key:
```dotenv
PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"
```

### Running the Example
To send an ERC-20 token transfer from an EVM chain (Sepolia) to a Substrate chain (Tangle), use the following command:

```bash
cd examples/evm-to-substrate-fungible-transfer
yarn run transfer
```

This script uses **ethers.js** in conjunction with the sygma-sdk to handle the cross-chain transfer. The example demonstrates how to transfer sygUSD tokens from the Sepolia Ethereum testnet to the Tangle Substrate testnet, where it will be received as the same token (sygUSD).


### Script functionality
The script performs the following steps:

1. Importing Required Packages

The first step is to import all necessary libraries, including the Sygma SDK, dotenv for managing environment variables, and ethers.js for interacting with the Ethereum blockchain.
```ts
import type { Eip1193Provider } from "@buildwithsygma/core";
import { createFungibleAssetTransfer } from "@buildwithsygma/evm";
import dotenv from "dotenv";
import { Wallet, providers } from "ethers";
import Web3HttpProvider from "web3-providers-http";

dotenv.config();
```
Here, dotenv.config() loads environment variables (such as private keys) from a .env file into process.env.

2. Loading and Validating the Private Key

The script fetches the **PRIVATE_KEY** from the .env file. If the private key is not found, an error is thrown to prevent the script from running without the necessary credentials.
```ts
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
    throw new Error("Missing environment variable: PRIVATE_KEY");
}
```

3. Setting up Constants
   Key constants are defined for the Sepolia and Tangle chain IDs, the sygUSD token’s Resource ID, and the Sepolia RPC URL. The script also sets up a function to generate the transaction URL for Etherscan, enabling easy tracking of the transaction.
```ts
const SEPOLIA_CHAIN_ID = 11155111;
const TANGLE_CHAIN_ID = 3799;
const RESOURCE_ID = "0x0000000000000000000000000000000000000000000000000000000000002000";
const SEPOLIA_RPC_URL = process.env.SOURCE_EVM_RPC_URL ?? "https://eth-sepolia.g.alchemy.com/v2/MeCKDrpxLkGOn4LMlBa3cKy1EzzOzwzG";

const explorerUrls: Record<number, string> = {
    [SEPOLIA_CHAIN_ID]: "https://sepolia.etherscan.io",
};

const getTxExplorerUrl = (params: { txHash: string; chainId: number }): string =>
    `${explorerUrls[params.chainId]}/tx/${params.txHash}`;
```
4. Defining the ERC-20 Transfer Function

The core logic for the token transfer is encapsulated in the erc20Transfer function. This function sets up the provider and wallet using ethers.js, connects to the Sepolia network, and prepares for the cross-chain transfer.
Set up the provider, wallet, and asset transfer objects using the TESTNET environment.

```ts
export async function erc20Transfer(): Promise<void> {
  const web3Provider = new Web3HttpProvider(SEPOLIA_RPC_URL);
  const ethersWeb3Provider = new providers.Web3Provider(web3Provider);
  const wallet = new Wallet(privateKey ?? "", ethersWeb3Provider);
  const sourceAddress = await wallet.getAddress();
  const destinationAddress = "5GjowPEaFNnwbrmpPuDmBVdF2e7n3cHwk2LnUwHXsaW5KtEL"; // Substrate address
```

5. Constructing the Transfer Object

The transfer object is created by specifying the source and destination chain IDs, the source and destination addresses, the amount to transfer (1 sygUSD token), and the token’s Resource ID.
```ts
  const params = {
    source: SEPOLIA_CHAIN_ID,
    destination: TANGLE_CHAIN_ID,
    sourceNetworkProvider: web3Provider as unknown as Eip1193Provider,
    resource: RESOURCE_ID,
    amount: BigInt(1) * BigInt(1e18), // 1 sygUSD token (18 decimals)
    recipientAddress: destinationAddress,
    sourceAddress: sourceAddress,
  };
```

Here, the transfer object specifies the details of the cross-chain transfer, including the network provider and the token amount.

6. Getting and Sending Approval Transactions

Before sending the transfer, the script needs to obtain and send approval transactions to allow the smart contract to move the user’s tokens. This step ensures that the tokens are authorized for transfer.

```ts
  const transfer = await createFungibleAssetTransfer(params);
  const approvals = await transfer.getApprovalTransactions();
  console.log(`Approving Tokens (${approvals.length})...`);

  for (const approval of approvals) {
    const response = await wallet.sendTransaction(approval);
    await response.wait();
    console.log(
      `Approved, transaction: ${getTxExplorerUrl({ txHash: response.hash, chainId: SEPOLIA_CHAIN_ID })}`
    );
  }
```

This loop iterates through each approval transaction, sending them through the Ethereum network and logging the transaction hash for tracking purposes.

7.  Sending the Transfer Transaction

After the approvals are complete, the script constructs and sends the actual cross-chain transfer transaction. The transfer is confirmed once the transaction is finalized on the Ethereum side.
```ts
  const transferTx = await transfer.getTransferTransaction();
  const response = await wallet.sendTransaction(transferTx);
  await response.wait();
  console.log(
    `Deposited, transaction: ${getTxExplorerUrl({ txHash: response.hash, chainId: SEPOLIA_CHAIN_ID })}`
  );
```

Once the transaction is confirmed, the console logs the deposit confirmation and provides the Etherscan link to track the transaction.

8. Executing the Transfer Function

Finally, the erc20Transfer function is executed. The .finally() method ensures that any necessary cleanup is performed once the function has completed.
```ts
erc20Transfer().finally(() => {});
```