<p align="center"><a href="https://buildwithsygma.com"><img width="250" title="Chainbridge UI" src='assets/full-logo.png'/></a></p>

# Sygma SDK

## Installing

Using npm:

`npm install @buildwithsygma/sygma-sdk-core`

Using yarn:

`yarn add @buildwithsygma/sygma-sdk-core`

## Introduction
**Sygma SDK** is an OpenSource (under GNU Lesser General Public License v3.0) SDK for developers to work with [Sygma bridge](https://github.com/sygmaprotocol/sygma-relayer). The SDK consist of methods that enable bridging capabilities between Ethereum networks.

***NOTE*** the SDK is under an active development so can be broken occasionally.

The current SDK has one package that comprises the whole bridging logic for transferring ERC20 tokens between Ethereum networks. Alongside this there are two folder examples that demonstrate the usage of our SDK. If you want to run the examples alongside our bridging infrastructure, please make sure you have [Sygma bridge](https://github.com/sygmaprotocol/sygma-relayer#local-environment) in order for you to run `make example` command.

## Running the Examples

For React example, after you have run and deployed the contracts using [Sygma bridge](https://github.com/sygmaprotocol/sygma-relayer), go to the [examples](https://github.com/sygmaprotocol/sygma-sdk/tree/main/examples) folder and follow the instructions in their README


# How to Use

## Environment

In order for you to use our SDK, first you need to clone [Sygma bridge](https://github.com/sygmaprotocol/sygma-relayer) repository to your local machine. After that, follow the instructions to run the local example. It will use docker and docker-compose to run 2 local RPC node and 2 relayers.

```bash
# inside the root directory of Sygma project
make example
```
<details>
  <summary>show example of the log from local setup</summary>
You should see something like this after the local setup has all the dependencies running

```bash
Attaching to evm1-1, evm2-1, example_relayer1, example_relayer2, example_relayer3, fee-oracle
evm1-1            | Ganache CLI v6.12.2 (ganache-core: 2.13.2)
evm1-1            | (node:1) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
evm1-1            | (Use `node --trace-deprecation ...` to show where the warning was created)
evm1-1            |
evm1-1            | Available Accounts
evm1-1            | ==================
evm1-1            | (0) 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (100 ETH)
evm1-1            | (1) 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 (100 ETH)
evm1-1            | (2) 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b (100 ETH)
evm1-1            | (3) 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d (100 ETH)
evm1-1            | (4) 0xd03ea8624C8C5987235048901fB614fDcA89b117 (100 ETH)
evm1-1            | (5) 0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC (100 ETH)
evm1-1            | (6) 0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9 (100 ETH)
evm1-1            | (7) 0x28a8746e75304c0780E011BEd21C72cD78cd535E (100 ETH)
evm1-1            | (8) 0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E (100 ETH)
evm1-1            | (9) 0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e (100 ETH)
evm1-1            |
evm1-1            | Private Keys
evm1-1            | ==================
evm1-1            | (0) 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
evm1-1            | (1) 0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1
evm1-1            | (2) 0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c
evm1-1            | (3) 0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913
evm1-1            | (4) 0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743
evm1-1            | (5) 0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd
evm1-1            | (6) 0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52
evm1-1            | (7) 0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3
evm1-1            | (8) 0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4
evm1-1            | (9) 0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773
evm1-1            |
evm1-1            | HD Wallet
evm1-1            | ==================
evm1-1            | Mnemonic:      myth like bonus scare over problem client lizard pioneer submit female collect
evm1-1            | Base HD Path:  m/44'/60'/0'/0/{account_index}
evm1-1            |
evm1-1            | Gas Price
evm1-1            | ==================
evm1-1            | 20000000000
evm1-1            |
evm1-1            | Gas Limit
evm1-1            | ==================
evm1-1            | 6721975
evm1-1            |
evm1-1            | Call Gas Limit
evm1-1            | ==================
evm1-1            | 9007199254740991
evm1-1            |
evm1-1            | Listening on 0.0.0.0:8545
evm2-1            | Ganache CLI v6.12.2 (ganache-core: 2.13.2)
evm2-1            | (node:1) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
evm2-1            | (Use `node --trace-deprecation ...` to show where the warning was created)
evm2-1            |
evm2-1            | Available Accounts
evm2-1            | ==================
evm2-1            | (0) 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (100 ETH)
evm2-1            | (1) 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 (100 ETH)
evm2-1            | (2) 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b (100 ETH)
evm2-1            | (3) 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d (100 ETH)
evm2-1            | (4) 0xd03ea8624C8C5987235048901fB614fDcA89b117 (100 ETH)
evm2-1            | (5) 0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC (100 ETH)
evm2-1            | (6) 0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9 (100 ETH)
evm2-1            | (7) 0x28a8746e75304c0780E011BEd21C72cD78cd535E (100 ETH)
evm2-1            | (8) 0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E (100 ETH)
evm2-1            | (9) 0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e (100 ETH)
evm2-1            |
evm2-1            | Private Keys
evm2-1            | ==================
evm2-1            | (0) 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
evm2-1            | (1) 0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1
evm2-1            | (2) 0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c
evm2-1            | (3) 0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913
evm2-1            | (4) 0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743
evm2-1            | (5) 0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd
evm2-1            | (6) 0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52
evm2-1            | (7) 0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3
evm2-1            | (8) 0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4
evm2-1            | (9) 0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773
evm2-1            |
evm2-1            | HD Wallet
evm2-1            | ==================
evm2-1            | Mnemonic:      myth like bonus scare over problem client lizard pioneer submit female collect
evm2-1            | Base HD Path:  m/44'/60'/0'/0/{account_index}
evm2-1            |
evm2-1            | Gas Price
evm2-1            | ==================
evm2-1            | 20000000000
evm2-1            |
evm2-1            | Gas Limit
evm2-1            | ==================
evm2-1            | 6721975
evm2-1            |
evm2-1            | Call Gas Limit
evm2-1            | ==================
evm2-1            | 9007199254740991
evm2-1            |
evm2-1            | Listening on 0.0.0.0:8545
example_relayer1 exited with code 0
fee-oracle        | time="2022-10-07T15:57:45Z" level=info msg="log level: debug"
fee-oracle        | time="2022-10-07T15:57:45Z" level=info msg="fee oracle indentity address: 0x70B7D7448982b15295150575541D1d3b862f7FE9\n" base=base
fee-oracle        | time="2022-10-07T15:57:45Z" level=warning msg="remote param operator is disabled" base=base
fee-oracle        | time="2022-10-07T15:57:45Z" level=info msg="running in: dev" base=base
fee-oracle        | time="2022-10-07T15:57:45Z" level=info msg="running mode: debug" base=base
fee-oracle        | time="2022-10-07T15:57:45Z" level=info msg="fee oracle app init success" base=base
fee-oracle        | time="2022-10-07T15:57:45Z" level=info msg="http server starts on port :8091 " base=base
fee-oracle        | time="2022-10-07T15:57:45Z" level=info msg="http server mode: debug " base=base
fee-oracle        | [GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
fee-oracle        |  - using env:	export GIN_MODE=release
fee-oracle        |  - using code:	gin.SetMode(gin.ReleaseMode)
fee-oracle        |
fee-oracle        | [GIN-debug] GET    /health                   --> github.com/ChainSafe/sygma-fee-oracle/api.(*Handler).healthCheck-fm (3 handlers)
fee-oracle        | [GIN-debug] GET    /v1/rate/from/:fromDomainID/to/:toDomainID/resourceid/:resourceID --> github.com/ChainSafe/sygma-fee-oracle/api.(*Handler).debugGetRate-fm (3 handlers)
fee-oracle        | [GIN-debug] [WARNING] You trusted all proxies, this is NOT safe. We recommend you to set a value.
fee-oracle        | Please check https://pkg.go.dev/github.com/gin-gonic/gin#readme-don-t-trust-all-proxies for details.
fee-oracle        | [GIN-debug] Listening and serving HTTP on :8091

```
</details>
With this addresses you can use our SDK with the `basic fee` setup.

After that, you can watch the logs an see your funds or NFT being transfer from one network to another

## Contract addresses for this setup

This is the list of the current contract addresses deployed in our local setup

| Contract | Address |
| -------- | ------- |
| Bridge   | 0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68 |
| ERC20Handler | 0x1ED1d77911944622FCcDDEad8A731fd77E94173e |
| ERC721Handler | 0x481f97f9C82a971B3844a422936a4d3c4082bF84 |
| GenericHandler | 0x783BB8123b8532CC85C8D2deF2f47C55D1e46b46 |
| FeeRouter | 0x9275AC64D6556BE290dd878e5aAA3a5bae08ae0C |
| BasicFeeHandler | 0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6 |
| ColorsExampleContract | 0xE54Dc792c226AEF99D6086527b98b36a4ADDe56a |
| ERC20Token | 0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A |
| ERC721Token | 0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94 |


If you want to use the bridge admin and import this account to your metamask, use the private key: `cc2c32b154490f09f70c1c8d4b997238448d649e0777495863db231c4ced3616`. Address of the bridge admin is: `0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b `


## Checking the Examples folder

There is a folder with examples ready to be used for the SDK. Currently we have two working (ERC20 transfer and NFT Transfer) with our current local setup. If you decide that is not for you, here is a little guide to get you started with our SDK.

### How to Use From NodeJS

Assuming you are going to use the local setup provider by [Sygma](https://github.com/sygmaprotocol/sygma-relayer), the setup that you need to pass to the `Sygma` class is going to have the following structure:

```ts
import { Sygma } from "@buildwithsygma/sygma-sdk-core";

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
```

We are going to use the SDK with `NodeJS` so, we are going to use the bridge admin to make the transfer. For this instantiate a wallet"

```ts
import { ethers } from 'ethers'
import { NonceManager } from "@ethersproject/experimental";

// connect to one of the nodes
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

// instantiate the waller with the following mnemonic
const wallet = ethers.Wallet.fromMnemonic(
  "black toward wish jar twin produce remember fluid always confirm bacon slush",
  "m/44'/60'/0'/0/0",
);

// connect the wallet to the provider
const walletConnected = wallet.connect(provider);

// use the NonceManager to avoid issues with the nonce
const managedSigner = new NonceManager(walletConnected);
```

Then we create a `setup` object to pass to the `Sygma` class. This setup uses the `bridgeSetup` defined above with the contract addresses.

```ts
const setup = { bridgeSetup }

const chainbridge = new Sygma(setup)
```

Now we are ready to initialize connection:

```ts
const bridgeEvents = sygma.initializeConnectionRPC(wallet.address)
```

With this we can get the basic Fee rate to use in our first deposit:

```ts
const basicFeeRate = await sygma.fetchFeeData({
  amount: "1",
  recipientAddress: wallet.address
})
```

Once this is complete, we can approve the amount of tokens to transfer before we make the deposit:

```ts
const approvalTxReceipt = await (await sygma.approve({
  amountForApproval: "1",
})).wait(1)

const depositTx = await sygma.deposit({
  amount: "1",
  recipientAddress: wallet.address
  feeData: basicFee
})

const depositEVent = await sygma.getDepositEventFromReceipt(depositTx)

const { depositNonce } = depositEvent.args

console.log("Result of transfer", depositTx)
console.log("Nonce of tranfer" , depositNonce)
```

### How to Use in Browser

For usage in the browser with our local setup, provide the same bridge config that you use for the NodeJS context:

```ts
import { Sygma } from "@buildwithsygma/sygma-sdk-core";

type LocalData = {
  balance: BigNumber;
  address: string;
  gasPrice: BigNumber;
  balanceOfTokens: BigNumber;
  tokenName: string;
};

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
```

Then, inside your App, create some state variables and functions to get account data from your wallet (in this example the wallet is `Metamask`)

```ts
function App(){
  const [bridge, setBridge] = useState<any | undefined>(undefined)

  const [logicConnected, setLogicConnected] = useState<boolean>(false);

  const [sygmaInstance, setSygmaInstance] = useState<Sygma | undefined>(undefined);

  const getAccountData = async (sygma: Sygma) => {
    try {
      const balance =
        (await sygma.getSignerBalance("chain1")) ?? BigNumber.from("0");
      const address = await sygma.getSignerAddress("chain1");
      const gasPrice = await sygma.getSignerGasPrice("chain1");
      const { balanceOfTokens, tokenName } = await sygma.getTokenInfo(
        "chain1"
      );
      console.log("signer balance", utils.formatEther(balance!));
      console.log("signer address", address);
      console.log("gas price", utils.formatEther(gasPrice!));
      console.log("balance of tokens", utils.formatUnits(balanceOfTokens, 18));
      setValue("address", address!)
      setAccountData({
        balance: balance!,
        address: address!,
        gasPrice: gasPrice!,
        balanceOfTokens: balanceOfTokens!,
        tokenName: tokenName!,
      });
      setIsReady(true);
    } catch (e) {
      console.log(e);
      console.log("Perhaps you forget to deploy the bridge?");
    }
  };

  useEffect(() => {
    if (data !== undefined && sygmaInstance !== undefined) {
      getAccountData(sygmaInstance);
    }
  }, [data, logicConnected]);

  useEffect(() => {
    if (metaIsConnected && sygmaInstance !== undefined) {
      handleConnect();
      getAccountData(sygmaInstance! as Sygma);
      // Update form values using useForm
      setValue("from", sygmaInstance.bridgeSetup?.chain1.domainId!)
      setValue("to", sygmaInstance.bridgeSetup?.chain2.domainId!)
    }
  }, [metaIsConnected]);

}
```

If you are using `Metamask` you can create a function to trigger the connection to the extension and at the same time instantiate `Sygma` SDK:

```ts
// in the App component, below the last useEffect

  const handleConnect = () => {
    // IF META IS NOT SIGNIN, TRIGGER POP OF THE WINDOW FOR THE EXTENSION
    if (!metaIsConnected) {
      return window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((r: any) => {
          console.log("request to unlock metamask", r);
          const [addr] = r;
          setMetaIsConnected(true);
          setAccountData({
            ...(accountData as LocalData),
            address: addr,
          });
        })
        .catch((error: any) => {
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log("Please connect to MetaMask.");
          } else {
            console.error(error);
          }
        });
    } else if (metaIsConnected) {

      const data = (sygmaInstance as Sygma).initializeConnectionFromWeb3Provider(
        window.ethereum
      );

      //@ts-ignore-line
      setData(data);
      setLogicConnected(true);
    }
  };
```

To listen to deposit events on the home network:

````ts
// initialization of Sygma class
// ...
sygmaInstance.createHomeChainDepositEventListener((
  destinationDomainId: any,
  resourceId: any,
  depositNonce: any,
  user: any,
  data: any,
  handleResponse: any,
  tx: any
) => {
  console.log(
    `bride deposit event deposit nonce: ${depositNonce.toString()} to contract with ResourceId: ${resourceId}`
  );
  console.log(` transaction hash: ${tx.transactionHash}`);
  console.info("Deposit in transit!");
});

````

To remove deposit events listener:

````ts
// initialization of Sygma class
// sygmaInstance.createHomeChainDepositEventListener(...)
// ...
sygmaInstance.removeHomeChainDepositEventListener()
````

To listen for execution events on the destination network:

````ts
// initialization of Sygma class
// ...
sygmaInstance.destinationProposalExecutionEventListener((
  originDomainId: any,
  despositNonce: any,
  dataHash: any,
  tx: any
) => {
  console.warn("Proposal execution event!")
  console.log({originDomainId, despositNonce, dataHash, tx} )
  console.warn("Transfer complete!")
});
````

To remove remove execution events listener:

````ts
// initialization of Sygma class
// sygmaInstance.createHomeChainDepositEventListener(...)
// ...
sygmaInstance.removeDestinationProposalExecutionEventListener()
````


With this you can use our SDK and create the render logic to show your tokens and your networks of the bridge. For a more in depth review, check out our `erc20` and `erc721` examples.

## Using Sygma SDK on your project

`TODO`


## Support
<a href="https://discord.gg/ykXsJKfhgq">
  <img alt="discord" src="https://img.shields.io/discord/593655374469660673?label=Discord&logo=discord&style=flat" />
</a>

## License
GNU Lesser General Public License v3.0
