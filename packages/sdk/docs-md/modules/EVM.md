[@buildwithsygma/sygma-sdk-core](../README.md) / [Exports](../modules.md) / EVM

# Namespace: EVM

Functions for interacting with bridge contracts on EVM chains.

## Table of contents

### Type Aliases

- [BridgeConfigParam](EVM.md#bridgeconfigparam)
- [Erc20TransferParamsType](EVM.md#erc20transferparamstype)
- [Erc721TransferParamsType](EVM.md#erc721transferparamstype)
- [FeeType](EVM.md#feetype)
- [TokenConfig](EVM.md#tokenconfig)
- [TokenDeposit](EVM.md#tokendeposit)
- [TokenTransfer](EVM.md#tokentransfer)

### Bridge deposit Functions

- [erc20Transfer](EVM.md#erc20transfer)
- [erc721Transfer](EVM.md#erc721transfer)
- [executeDeposit](EVM.md#executedeposit)
- [getDepositEventFromReceipt](EVM.md#getdepositeventfromreceipt)
- [processTokenTranfer](EVM.md#processtokentranfer)

### Event handling Functions

- [connectToBridge](EVM.md#connecttobridge)
- [createDepositEventListener](EVM.md#createdepositeventlistener)
- [createProposalExecutionEventListener](EVM.md#createproposalexecutioneventlistener)
- [getProviderByRpcUrl](EVM.md#getproviderbyrpcurl)
- [proposalExecutionEventListenerCount](EVM.md#proposalexecutioneventlistenercount)
- [removeDepositEventListener](EVM.md#removedepositeventlistener)
- [removeProposalExecutionEventListener](EVM.md#removeproposalexecutioneventlistener)

### Fee Functions

- [calculateBasicfee](EVM.md#calculatebasicfee)
- [calculateDynamicFee](EVM.md#calculatedynamicfee)
- [getFeeHandlerAddress](EVM.md#getfeehandleraddress)

### Token iteractions Functions

- [approve](EVM.md#approve)
- [getERC20Allowance](EVM.md#geterc20allowance)
- [isApproved](EVM.md#isapproved)

### Helpers Functions

- [addPadding](EVM.md#addpadding)
- [constructDepositDataEvmSubstrate](EVM.md#constructdepositdataevmsubstrate)
- [constructMainDepositData](EVM.md#constructmaindepositdata)
- [createERCDepositData](EVM.md#createercdepositdata)
- [createPermissionedGenericDepositData](EVM.md#createpermissionedgenericdepositdata)
- [createPermissionlessGenericDepositData](EVM.md#createpermissionlessgenericdepositdata)
- [getTokenDecimals](EVM.md#gettokendecimals)
- [isEIP1559MaxFeePerGas](EVM.md#iseip1559maxfeepergas)
- [isERC20](EVM.md#iserc20)
- [isUint8](EVM.md#isuint8)
- [toHex](EVM.md#tohex)

## Type Aliases

### BridgeConfigParam

Ƭ **BridgeConfigParam**: `Object`

The config of the bridge

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridgeAddress` | `string` | The address of the bridge contract. |
| `confirmations?` | `number` | The optional number of confirmations |
| `domainId` | `string` | The domainId is an identifier of bridge in Sygma ecosystem. |
| `erc20HandlerAddress` | `string` | The address of the ERC20 handler contract. |
| `erc721HandlerAddress` | `string` | The address of the ERC721 handler contract. |
| `tokens` | [`TokenConfig`](EVM.md#tokenconfig)[] | An array of token configurations. |

#### Defined in

[chains/EVM/types/index.ts:40](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/types/index.ts#L40)

___

### Erc20TransferParamsType

Ƭ **Erc20TransferParamsType**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `amountOrId` | `string` | The amount of tokens to transfer |
| `bridgeInstance` | `Bridge` | The bridge instance used for the transfer. |
| `domainId` | `string` | The unique identifier for the destination network on the bridge. |
| `feeData` | [`FeeDataResult`](../modules.md#feedataresult) | The fee data associated with the ERC20 token transfer, including the gas price and gas limit. |
| `handlerAddress` | `string` | The handler address responsible for processing the ERC20 token transfer. |
| `overrides?` | `ethers.PayableOverrides` | Optional overrides for the transaction, such as gas price, gas limit, or value. |
| `provider` | `providers.Provider` | The provider used to interact with the blockchain network. |
| `recipientAddress` | `string` | The recipient's address to receive the tokens. |
| `resourceId` | `string` | The unique identifier for the resource being transferred. |
| `tokenInstance` | `ERC20` | The ERC20 token instance used for the transfer. |

#### Defined in

[chains/EVM/types/index.ts:79](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/types/index.ts#L79)

___

### Erc721TransferParamsType

Ƭ **Erc721TransferParamsType**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `amountOrId` | `string` | The tokenId for a specific ERC721 token being transferred. |
| `bridgeInstance` | `Bridge` | The bridge instance used for the transfer. |
| `domainId` | `string` | The unique identifier for the destination network on the bridge. |
| `feeData` | [`FeeDataResult`](../modules.md#feedataresult) | The fee data associated with the ERC721 token transfer. |
| `handlerAddress` | `string` | The handler address responsible for processing the ERC721 token transfer. |
| `overrides?` | `ethers.PayableOverrides` | Optional overrides for the transaction, such as gas price, gas limit, or value. |
| `provider` | `providers.Provider` | The provider used to interact with the blockchain network. |
| `recipientAddress` | `string` | The recipient's address to receive the token. |
| `resourceId` | `string` | The unique identifier for the resource being transferred. |
| `tokenInstance` | `ERC721MinterBurnerPauser` | The ERC721 token instance used for the transfer. |

#### Defined in

[chains/EVM/types/index.ts:102](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/types/index.ts#L102)

___

### FeeType

Ƭ **FeeType**: ``"basic"`` \| ``"feeOracle"`` \| ``"none"``

Fee startegies of the Bridge
 Where "basic" stands for fixed fee and "feeOracle" is for dynamic

#### Defined in

[chains/EVM/types/index.ts:36](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/types/index.ts#L36)

___

### TokenConfig

Ƭ **TokenConfig**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The address of the token contract. |
| `decimals?` | `number` | The optional number of decimals for the token. |
| `feeSettings` | { `address`: `string` ; `type`: [`FeeType`](EVM.md#feetype)  } | The fee settings for the token. |
| `feeSettings.address` | `string` | The address of fee handler contract. |
| `feeSettings.type` | [`FeeType`](EVM.md#feetype) | The type of fee, either 'basic', 'feeOracle', or 'none'. |
| `imageUri?` | `string` | The optional URI of the token image. |
| `isDoubleApproval?` | `boolean` | An optional flag indicating if the token requires double approval (like USDT). |
| `isNativeWrappedToken?` | `boolean` | An optional flag indicating if the token is a native wrapped token. |
| `name?` | `string` | The optional name of the token. |
| `resourceId` | `string` | The resource identifier of the token. |
| `symbol?` | `string` | The optional symbol of the token. |
| `type` | ``"erc20"`` \| ``"erc721"`` | The token type (ERC20 or ERC721) |

#### Defined in

[chains/EVM/types/index.ts:5](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/types/index.ts#L5)

___

### TokenDeposit

Ƭ **TokenDeposit**: `Object`

The information needed for processing the token transfer deposit.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `amountOrId` | `string` | The amount of tokens to transfer or tokenId for ERC721 token, depending on the use case. |
| `feeData` | [`FeeDataResult`](../modules.md#feedataresult) | The fee data associated with the token transfer. |
| `recipientAddress` | `string` | The recipient's address to receive the tokens. |
| `resourceId` | `string` | The unique identifier for the resource being transferred. |

#### Defined in

[chains/EVM/types/index.ts:57](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/types/index.ts#L57)

___

### TokenTransfer

Ƭ **TokenTransfer**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridgeConfig` | [`BridgeConfigParam`](EVM.md#bridgeconfigparam) | The bridge configuration parameters for processing the token transfer. |
| `depositParams` | [`TokenDeposit`](EVM.md#tokendeposit) | The information needed for processing the token transfer deposit. |
| `overrides?` | `ethers.PayableOverrides` | Optional overrides for the transaction, such as gas price, gas limit, or value. |
| `provider` | `providers.Provider` | The provider used to interact with the blockchain network. |

#### Defined in

[chains/EVM/types/index.ts:68](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/types/index.ts#L68)

## Bridge deposit Functions

### erc20Transfer

▸ **erc20Transfer**(`params`): `Promise`<`ContractTransaction`\>

Perform an erc20 transfer

**`Example`**

```ts
const params = {
  amountOrId: '100',
  recipientAddress: '0x1234567890123456789012345678901234567890',
  tokenInstance: new ERC20(), // ERC20 instance
  bridgeInstance: new Bridge(), // Bridge instance from the sygma-contracts
  handlerAddress: '0x0987654321098765432109876543210987654321',
  domainId: '1',
  resourceId: '0x000000000000000001',
  feeData: { ... }, // fee data
  confirmations: 6,
  provider: new ethers.providers.Web3Provider(window.ethereum),
  overrides: { gasLimit: 1000000 } // optional
}
const transaction = await erc20Transfer(params)
// wait for the transaction to be mined
const receipt = await transaction.wait(3)
// get the deposit event
const depositEvent = getDepositEvent(receipt)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`Erc20TransferParamsType`](EVM.md#erc20transferparamstype) | The parameters for the erc20 transfer function. |

#### Returns

`Promise`<`ContractTransaction`\>

- The transaction receipt.

#### Defined in

[chains/EVM/utils/depositFns.ts:49](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/depositFns.ts#L49)

___

### erc721Transfer

▸ **erc721Transfer**(`params`): `Promise`<`ContractTransaction`\>

Perform an erc721 transfer

**`Example`**

```ts
const params = {
  domainId: '9',
  resourceId: '0x00001',
  amountOrId: '123123123', // tokenID from the ERC721
  recipientAddress: '0x123ABCD',
  handlerAddress: '0xabc123',
  tokenInstance: new ERC721MinterBurnerPauser(), // from the sygma-contacts
  bridgeInstance: new Bridge(),  // from the sygma-contacts
  feeData: { .. }, // fee data
  confirmations: 10,
  provider: new ethers.providers.Web3Provider(window.ethereum),
};
const receipt = await erc721Transfer(params);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`Erc721TransferParamsType`](EVM.md#erc721transferparamstype) | The parameters for ERC721 token transfer. |

#### Returns

`Promise`<`ContractTransaction`\>

A promise that resolves to the contract receipt.

#### Defined in

[chains/EVM/utils/depositFns.ts:109](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/depositFns.ts#L109)

___

### executeDeposit

▸ **executeDeposit**(`domainId`, `resourceId`, `depositData`, `feeData`, `bridgeInstance`, `provider`, `overrides?`): `Promise`<`ContractTransaction`\>

Executes a deposit operation using the specified parameters and returns a contract receipt.

**`Example`**

```ts
const domainId = '1';
const resourceId = '0x1234567890123456789012345678901234567890';
const depositData = '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
const feeData = { type: 'basic', fee: ethers.BigNumber.from('1000000000000000'), feeData: {} }; // fee data is madatory
const bridgeInstance = new Bridge() // Bridge instance from sygma-contracts package;
const confirmations = 3;
const provider = new ethers.providers.JsonRpcProvider();
const overrides = { gasLimit: 200000 };

const transaction = executeDeposit(domainId, resourceId, depositData, feeData, bridgeInstance, confirmations, provider, overrides)
  .then((receipt) => console.log('Deposit executed:', receipt))
  .catch((error) => console.error('Error on deposit execution:', error));
// wait for 10 confiramtions to finalize the transaction
const receipt = await transaction.wait(10)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `domainId` | `string` | The unique identifier for destination network. |
| `resourceId` | `string` | The resource ID associated with the token. |
| `depositData` | `string` | The deposit data required for the operation. |
| `feeData` | [`FeeDataResult`](../modules.md#feedataresult) | The fee data result for the deposit operation. |
| `bridgeInstance` | `Bridge` | The bridge instance used to perform the deposit operation. |
| `provider` | `Provider` | The provider used for the Ethereum network connection. |
| `overrides?` | `PayableOverrides` | Optional transaction overrides to be applied. |

#### Returns

`Promise`<`ContractTransaction`\>

A promise that resolves to a contract receipt once the deposit is executed.

#### Defined in

[chains/EVM/utils/depositFns.ts:171](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/depositFns.ts#L171)

___

### getDepositEventFromReceipt

▸ **getDepositEventFromReceipt**(`depositTx`, `bridgeContract`): `Promise`<`DepositEvent`\>

Retrieves the deposit event from a given contract receipt.

**`Example`**

```ts
// Assuming you have a valid contract receipt (contractReceipt) and a bridge contract instance (bridge)
const depositEvent = await getDepositEventFromReceipt(contractReceipt, bridge);
console.log('Deposit event:', depositEvent);
console.log('Deposit nonce:', depositEvent.args.depositNonce)
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `depositTx` | `ContractReceipt` | The contract receipt containing the deposit transaction details. |
| `bridgeContract` | `Bridge` | The bridge contract instance used to query the deposit event. |

#### Returns

`Promise`<`DepositEvent`\>

A promise that resolves to the deposit event associated with the given contract receipt.

#### Defined in

[chains/EVM/utils/depositFns.ts:217](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/depositFns.ts#L217)

___

### processTokenTranfer

▸ **processTokenTranfer**(`params`): `Promise`<`ContractTransaction`\>

Processes a token transfer to the bridge on top level of abstracttion, handling both ERC20 and ERC721 tokens.

**`Example`**

```ts
// this short example could miss some params, please look at types for correct info
const depositParams = {
  resourceId: '0x123',
  amountOrId: "100",
  recepientAddress:"0x0123",
  feeData: "// fee data ///"
};
const bridgeConfig = {
 tokens: [{
   resourceId: '0x123',
   address: '0x456',
   type: 'erc20'
 }],
 bridgeAddress: '0x789',
 domainId: 1
};
const provider = new ethers.providers.Web3Provider(window.ethereum);
// any override settting for etherjs tranasaction
const overrides = { gasLimit: 100000 };
const receipt =
 await processTokenTranfer({
   depositParams,
   bridgeConfig,
   provider,
   overrides
 });
// use the getDepositEventFromReceipt method to get the depositNonce
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`TokenTransfer`](EVM.md#tokentransfer) | The parameters for processing the token transfer. |

#### Returns

`Promise`<`ContractTransaction`\>

- A promise that resolves to the transaction receipt once the transfer is complete.

#### Defined in

[chains/EVM/utils/depositFns.ts:268](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/depositFns.ts#L268)

___

## Event handling Functions

### connectToBridge

▸ **connectToBridge**(`bridgeAddress`, `signerOrProvider`): `Bridge`

Connects to an EVM Bridge contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridgeAddress` | `string` | The address of the bridge contract. |
| `signerOrProvider` | `Signer` \| `Provider` | The signer or provider to use for connecting to the bridge contract. |

#### Returns

`Bridge`

The connected Bridge contract instance.

#### Defined in

[chains/EVM/utils/eventListeners.ts:96](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/eventListeners.ts#L96)

___

### createDepositEventListener

▸ **createDepositEventListener**(`bridge`, `userAddress`, `callbackFn`): `Bridge`

Creates an event listener for deposit events on the specified Bridge contract.

**`Example`**

```ts
const bridge = new Bridge(...); // Instantiate your Bridge contract instance.
const userAddress = "0x123...";

function depositCallback(destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx) {
  console.log("Deposit event triggered:");
  console.log("destinationDomainId", destinationDomainId);
  console.log("resourceId", resourceId);
  console.log("depositNonce", depositNonce.toString());
  console.log("user", user);
  console.log("data", data);
  console.log("handleResponse", handleResponse);
  console.log("tx", tx);
}
const eventBridge = createDepositEventListener(bridge, userAddress, depositCallback);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridge` | `Bridge` | The Bridge contract instance. |
| `userAddress` | `string` | The user address to filter deposit events for. |
| `callbackFn` | (`destinationDomainId`: `number`, `resourceId`: `string`, `depositNonce`: `BigNumber`, `user`: `string`, `data`: `string`, `handleResponse`: `string`, `tx`: `Event`) => `void` | The callback function to be executed when a deposit event is triggered. |

#### Returns

`Bridge`

- The Bridge contract instance with the event listener attached.

#### Defined in

[chains/EVM/utils/eventListeners.ts:147](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/eventListeners.ts#L147)

___

### createProposalExecutionEventListener

▸ **createProposalExecutionEventListener**(`homeDepositNonce`, `bridge`, `callbackFn`): `Bridge`

Creates a ProposalExecution event listener for a given Bridge instance.
Proposal execution event usually emits after funds are transferred from the bridge contract on the destination chain.

**`Example`**

```ts
const depositNonce = 42 // get your depositNonce from deposit event
const bridgeInstance = Bridge__factory.connect(...) // your bridge contract instance from sygma-contracts
createProposalExecutionEventListener(
 depositNonce,
 bridgeInstance,
 (originDomainId, depositNonce, dataHash, tx) => {
   console.log(
     "execution events callback",
     originDomainId,
     depositNonce,
     dataHash,
     tx
   );
 }
);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `homeDepositNonce` | `number` | The deposit nonce of the home chain. |
| `bridge` | `Bridge` | The Bridge Contract instance to listen to. |
| `callbackFn` | (`originDomainId`: `number`, `depositNonce`: `BigNumber`, `dataHash`: `string`, `tx`: `Event`) => `void` | Callback function to execute when a ProposalExecution event is emitted. |

#### Returns

`Bridge`

The Bridge Contract instance with the event listener attached.

#### Defined in

[chains/EVM/utils/eventListeners.ts:40](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/eventListeners.ts#L40)

___

### getProviderByRpcUrl

▸ **getProviderByRpcUrl**(`rpcURL`): `JsonRpcProvider`

Creates a new JsonRpcProvider instance based on the given RPC URL

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rpcURL` | `string` | The RPC URL to use for the provider |

#### Returns

`JsonRpcProvider`

A new JsonRpcProvider instance

#### Defined in

[chains/EVM/utils/eventListeners.ts:110](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/eventListeners.ts#L110)

___

### proposalExecutionEventListenerCount

▸ **proposalExecutionEventListenerCount**(`bridge`): `number`

Returns the number of listeners for the ProposalExecution event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridge` | `Bridge` | The bridge to get the listener count from. |

#### Returns

`number`

The number of listeners for the ProposalExecution event.

#### Defined in

[chains/EVM/utils/eventListeners.ts:70](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/eventListeners.ts#L70)

___

### removeDepositEventListener

▸ **removeDepositEventListener**(`bridge`): `Bridge`

Removes the deposit event listener from the bridge instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridge` | `Bridge` | a Bridge instance to remove the listener from. |

#### Returns

`Bridge`

- bridge instance without the deposit listener.

#### Defined in

[chains/EVM/utils/eventListeners.ts:177](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/eventListeners.ts#L177)

___

### removeProposalExecutionEventListener

▸ **removeProposalExecutionEventListener**(`bridge`): `Bridge`

Removes a Proposal Execution event listener from the Bridge.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridge` | `Bridge` | The Bridge instance to remove the listener from. |

#### Returns

`Bridge`

The Bridge instance with the listener removed.

#### Defined in

[chains/EVM/utils/eventListeners.ts:83](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/eventListeners.ts#L83)

___

## Fee Functions

### calculateBasicfee

▸ **calculateBasicfee**(`-`): `Promise`<[`FeeDataResult`](../modules.md#feedataresult)\>

Calculates and returns the feeData object after query the FeeOracle service

**`Example`**

```ts
const basicFeeData = await calculateBasicfee({
  basicFeeHandlerAddress: '0x1234...',
  provider: new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID'),
  sender: '0x5678...',
  fromDomainID: '1',
  toDomainID: '2',
  resourceID: '0x00000...0001',
  tokenAmount: '100',
  recipientAddress: '0xdef0...',
});
console.log(basicFeeData);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `-` | `Object` | Object to get the fee data |
| `-.basicFeeHandlerAddress` | `string` | - |
| `-.fromDomainID` | `string` | - |
| `-.provider` | `Provider` | - |
| `-.recipientAddress` | `string` | - |
| `-.resourceID` | `string` | - |
| `-.sender` | `string` | - |
| `-.toDomainID` | `string` | - |
| `-.tokenAmount` | `string` | - |

#### Returns

`Promise`<[`FeeDataResult`](../modules.md#feedataresult)\>

#### Defined in

[chains/EVM/fee/basicFee.ts:26](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/fee/basicFee.ts#L26)

___

### calculateDynamicFee

▸ **calculateDynamicFee**(`options`): `Promise`<[`FeeDataResult`](../modules.md#feedataresult)\>

Calculates the dynamic fee for a transaction using the provided parameters and the Fee Oracle.

**`Example`**

```ts
const provider = new ethers.providers.JsonRpcProvider();
const result = await calculateDynamicFee({
  provider,
  sender: '0x123...',
  recipientAddress: '0x456...',
  fromDomainID: 1,
  toDomainID: 2,
  resourceID: 'resource-id',
  tokenAmount: '1000',
  feeOracleBaseUrl: 'https://fee-oracle.example.com/',
  feeOracleHandlerAddress: '0x789...',
});
console.log(result);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Object` | An object containing the following properties: |
| `options.dynamicERC20FeeHandlerAddress` | `string` | The address of dynamic fee handler |
| `options.feeOracleBaseUrl` | `string` | The base URL of the Fee Oracle. |
| `options.fromDomainID` | `number` | The domainId of the home network |
| `options.provider` | `Provider` | The ethers provider to use. |
| `options.recipientAddress` | `string` | The address of the recipient. |
| `options.resourceID` | `string` | The resourceId of the token/asset |
| `options.sender` | `string` | The address of the sender. |
| `options.toDomainID` | `number` | The domainId of the destination network |
| `options.tokenAmount` | `string` | The amount of tokens being transferred. |

#### Returns

`Promise`<[`FeeDataResult`](../modules.md#feedataresult)\>

The result of the calculation, containing the fee, calculated rate, ERC20 token address, fee data, and type.

#### Defined in

[chains/EVM/fee/dynamicFee.ts:93](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/fee/dynamicFee.ts#L93)

___

### getFeeHandlerAddress

▸ **getFeeHandlerAddress**(`signerOrProvider`, `feeRouterAddress`, `domainId`, `resourceId`): `Promise`<`string`\>

Retrieves the fee handler address for the given domain ID and resource ID from the FeeHandlerRouter contract.

**`Example`**

```ts
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const feeRouterAddress = '0x1234...';
const domainId = '1';
const resourceId = '0x123ABCD...';

getFeeHandlerAddress(provider, feeRouterAddress, domainId, resourceId)
  .then(feeHandlerAddress => {
    console.log('Fee Handler Address:', feeHandlerAddress);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signerOrProvider` | `Signer` \| `JsonRpcProvider` | The JSON RPC provider or signer object. |
| `feeRouterAddress` | `string` | The address of the FeeHandlerRouter contract. |
| `domainId` | `string` | The domain ID for which the fee handler address is to be fetched. |
| `resourceId` | `string` | The resource ID for which the fee handler address is to be fetched. |

#### Returns

`Promise`<`string`\>

A promise that resolves to the fee handler address.

#### Defined in

[chains/EVM/fee/feeHandler.ts:28](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/fee/feeHandler.ts#L28)

___

## Token iteractions Functions

### approve

▸ **approve**(`amountOrIdForApproval`, `tokenInstance`, `handlerAddress`, `confirmations`, `overrides?`): `Promise`<`ContractReceipt`\>

Approves the specified token instance for a given amount or tokenId and the handler address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amountOrIdForApproval` | `BigNumber` | The amount or tokenId to be approved. |
| `tokenInstance` | `ERC20` \| `ERC721MinterBurnerPauser` | The ERC20 or ERC721 token instance to be approved. |
| `handlerAddress` | `string` | The handler address for which the token is being approved. |
| `confirmations` | `number` | The number of confirmations required before the transaction is considered successful. |
| `overrides?` | `PayableOverrides` | Optional overrides for the transaction, such as gas price, gas limit, |

#### Returns

`Promise`<`ContractReceipt`\>

A promise that resolves to a contract receipt once the approval transaction is executed.

#### Defined in

[chains/EVM/utils/approvesAndChecksFns.ts:74](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/approvesAndChecksFns.ts#L74)

___

### getERC20Allowance

▸ **getERC20Allowance**(`senderAddress`, `erc20Instance`, `erc20HandlerAddress`): `Promise`<`number`\>

Retrieves the current allowance of an ERC20 token for the specified sender and handler addresses.

**`Example`**

```ts
// Assuming you have a valid sender address, an ERC20 token instance (erc20Instance), and a handler address (erc20HandlerAddress)
const currentAllowance = await getERC20Allowance(senderAddress, erc20Instance, erc20HandlerAddress);
console.log('Current allowance:', currentAllowance);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `senderAddress` | `string` | The address of the token sender. |
| `erc20Instance` | `ERC20` | The ERC20 token instance used to query the allowance. |
| `erc20HandlerAddress` | `string` | The handler address for which the token allowance is checked. |

#### Returns

`Promise`<`number`\>

A promise that resolves to a number representing the current allowance of the ERC20 token.

#### Defined in

[chains/EVM/utils/approvesAndChecksFns.ts:47](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/approvesAndChecksFns.ts#L47)

___

### isApproved

▸ **isApproved**(`tokenId`, `tokenInstance`, `handlerAddress`): `Promise`<`boolean`\>

Determines whether the specified token is approved for the provided handler address.

**`Example`**

```ts
// Assuming you have a valid tokenId, an ERC721 token instance (tokenInstance), and a handler address (handlerAddress)
const tokenApproved = await isApproved(tokenId, tokenInstance, handlerAddress);
console.log(`Token approval status for ${tokenID}:`, isApproved);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenId` | `number` | The TokenId of the token to be checked. |
| `tokenInstance` | `ERC721MinterBurnerPauser` | The ERC721 token instance used to query the approval status. |
| `handlerAddress` | `string` | The handler address for which the token approval status is checked. |

#### Returns

`Promise`<`boolean`\>

A promise that resolves to a boolean indicating whether the token is approved for the handler address.

#### Defined in

[chains/EVM/utils/approvesAndChecksFns.ts:18](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/utils/approvesAndChecksFns.ts#L18)

___

## Helpers Functions

### addPadding

▸ **addPadding**(`covertThis`, `padding`): `string`

Pads the data
based on ethers.utils.hexZeroPad

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `covertThis` | `string` \| `number` | data to convert |
| `padding` | `number` | padding |

#### Returns

`string`

#### Defined in

[chains/EVM/helpers.ts:28](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L28)

___

### constructDepositDataEvmSubstrate

▸ **constructDepositDataEvmSubstrate**(`tokenAmount`, `recipientAddress`, `decimals?`): `string`

Constructs the deposit data for an EVM-Substrate bridge transaction.

**`Example`**

```ts
// EVM address
constructDepositDataEvmSubstrate('1', '0x1234567890123456789012345678901234567890', 18);
```

**`Example`**

```ts
// Substrate address
constructDepositDataEvmSubstrate('2', '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt', 12);
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `tokenAmount` | `string` | `undefined` | The amount of tokens to be transferred. |
| `recipientAddress` | `string` | `undefined` | The address of the recipient. |
| `decimals?` | `number` | `18` | The number of decimals of the token. |

#### Returns

`string`

The deposit data as hex string

#### Defined in

[chains/EVM/helpers.ts:91](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L91)

___

### constructMainDepositData

▸ **constructMainDepositData**(`tokenStats`, `destRecipient`): `Uint8Array`

Constructs the main deposit data for a given token and recipient.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenStats` | `BigNumber` | The amount of ERC20 tokens or the token ID of ERC721 tokens. |
| `destRecipient` | `Uint8Array` | The recipient address in bytes array |

#### Returns

`Uint8Array`

The main deposit data in bytes array

#### Defined in

[chains/EVM/helpers.ts:62](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L62)

___

### createERCDepositData

▸ **createERCDepositData**(`tokenAmountOrID`, `lenRecipientAddress`, `recipientAddress`): `string`

Creates the deposit data to use on bridge.deposit method interface

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAmountOrID` | `string` \| `number` \| `BigNumber` | number \| string \| BigNumber of the amount of token or Id fo the token |
| `lenRecipientAddress` | `number` |  |
| `recipientAddress` | `string` |  |

#### Returns

`string`

#### Defined in

[chains/EVM/helpers.ts:41](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L41)

___

### createPermissionedGenericDepositData

▸ **createPermissionedGenericDepositData**(`hexMetaData`): `string`

Creates data for permissioned generic handler

#### Parameters

| Name | Type |
| :------ | :------ |
| `hexMetaData` | `string` |

#### Returns

`string`

#### Defined in

[chains/EVM/helpers.ts:113](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L113)

___

### createPermissionlessGenericDepositData

▸ **createPermissionlessGenericDepositData**(`executeFunctionSignature`, `executeContractAddress`, `maxFee`, `depositor`, `executionData`, `depositorCheck?`): `string`

Creates the data for permissionless generic handler

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `executeFunctionSignature` | `string` | `undefined` | execution function signature |
| `executeContractAddress` | `string` | `undefined` | execution contract address |
| `maxFee` | `string` | `undefined` | max fee defined |
| `depositor` | `string` | `undefined` | address of depositor on destination chain |
| `executionData` | `string` | `undefined` | the data to pass as parameter of the function being called on destination chain |
| `depositorCheck` | `boolean` | `true` | true if you want to check depositor |

#### Returns

`string`

#### Defined in

[chains/EVM/helpers.ts:133](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L133)

___

### getTokenDecimals

▸ **getTokenDecimals**(`tokenInstance`): `Promise`<`number`\>

Gets the number of decimals for an ERC20 token.

**`Throws`**

Error if the input token instance is not an ERC20 token.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenInstance` | `ERC20` | An instance of an ERC20 token. |

#### Returns

`Promise`<`number`\>

- A promise that resolves with the number of decimals for the token.

#### Defined in

[chains/EVM/helpers.ts:166](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L166)

___

### isEIP1559MaxFeePerGas

▸ **isEIP1559MaxFeePerGas**(`provider`): `Promise`<`BigNumber`\>

Check the fee data of the provider and returns the gas price if the node is not EIP1559

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `provider` | `Provider` | JsonRpcProvider \| Web3Provider |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[chains/EVM/helpers.ts:203](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L203)

___

### isERC20

▸ **isERC20**(`tokenInstance`): tokenInstance is ERC20

Type guard function that determines if a given object is an instance of the ERC20 interface.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenInstance` | `ERC20` | The object to be checked. |

#### Returns

tokenInstance is ERC20

- Returns `true` if the object is an instance of ERC20, `false` otherwise.

#### Defined in

[chains/EVM/helpers.ts:180](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L180)

___

### isUint8

▸ **isUint8**(`value`): `boolean`

Checks if a given value is a number within the range of 0 and 255.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | The value to check. |

#### Returns

`boolean`

- `true` if the number is within the range of 0 and 255, otherwise `false`.

#### Defined in

[chains/EVM/helpers.ts:191](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L191)

___

### toHex

▸ **toHex**(`covertThis`, `padding`): `string`

Return hex data padded to the number defined as padding
based on ethers.utils.hexZeroPad

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `covertThis` | `string` \| `number` \| `BigNumber` | data to convert |
| `padding` | `number` | number to padd the data |

#### Returns

`string`

#### Defined in

[chains/EVM/helpers.ts:14](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/EVM/helpers.ts#L14)
