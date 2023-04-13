[@buildwithsygma/sygma-sdk-core](../README.md) / [Exports](../modules.md) / Sygma

# Class: Sygma

**`Deprecated`**

since version 1.4.0

**`Name`**

Sygma

**`Description`**

Sygma is the main class that allows you to have bridging capabilities
with simple usage

## Implements

- [`SygmaSDK`](../interfaces/SygmaSDK.md)

## Table of contents

### Constructors

- [constructor](Sygma.md#constructor)

### Properties

- [bridgeSetup](Sygma.md#bridgesetup)
- [bridgeSetupList](Sygma.md#bridgesetuplist)
- [bridges](Sygma.md#bridges)
- [currentBridge](Sygma.md#currentbridge)
- [ethersProvider](Sygma.md#ethersprovider)
- [feeOracleSetup](Sygma.md#feeoraclesetup)
- [providers](Sygma.md#providers)
- [selectedToken](Sygma.md#selectedtoken)
- [signers](Sygma.md#signers)
- [tokens](Sygma.md#tokens)

### Methods

- [approve](Sygma.md#approve)
- [approveFeeHandler](Sygma.md#approvefeehandler)
- [checkCurrentAllowance](Sygma.md#checkcurrentallowance)
- [checkCurrentAllowanceForFeeHandler](Sygma.md#checkcurrentallowanceforfeehandler)
- [computeContract](Sygma.md#computecontract)
- [computeContracts](Sygma.md#computecontracts)
- [connectToBridge](Sygma.md#connecttobridge)
- [connectToken](Sygma.md#connecttoken)
- [createDepositEventListener](Sygma.md#createdepositeventlistener)
- [createHomeChainDepositEventListener](Sygma.md#createhomechaindepositeventlistener)
- [createProposalExecutionEventListener](Sygma.md#createproposalexecutioneventlistener)
- [deposit](Sygma.md#deposit)
- [depositGeneric](Sygma.md#depositgeneric)
- [destinationProposalExecutionEventListener](Sygma.md#destinationproposalexecutioneventlistener)
- [fetchBasicFeeData](Sygma.md#fetchbasicfeedata)
- [fetchFeeData](Sygma.md#fetchfeedata)
- [fetchFeeOracleData](Sygma.md#fetchfeeoracledata)
- [formatPermissionedGenericDepositData](Sygma.md#formatpermissionedgenericdepositdata)
- [formatPermissionlessGenericDepositData](Sygma.md#formatpermissionlessgenericdepositdata)
- [getAppoved](Sygma.md#getappoved)
- [getBridgeSetup](Sygma.md#getbridgesetup)
- [getDepositEventFromReceipt](Sygma.md#getdepositeventfromreceipt)
- [getDestinationChainProvider](Sygma.md#getdestinationchainprovider)
- [getFeeHandlerAddress](Sygma.md#getfeehandleraddress)
- [getFeeRouterAddress](Sygma.md#getfeerouteraddress)
- [getSelectedToken](Sygma.md#getselectedtoken)
- [getSelectedTokenAddress](Sygma.md#getselectedtokenaddress)
- [getSigner](Sygma.md#getsigner)
- [getSignerAddress](Sygma.md#getsigneraddress)
- [getSignerBalance](Sygma.md#getsignerbalance)
- [getSignerGasPrice](Sygma.md#getsignergasprice)
- [getTokenBalance](Sygma.md#gettokenbalance)
- [getTokenInfo](Sygma.md#gettokeninfo)
- [hasTokenSupplies](Sygma.md#hastokensupplies)
- [initializeConnectionFromWeb3Provider](Sygma.md#initializeconnectionfromweb3provider)
- [initializeConnectionRPC](Sygma.md#initializeconnectionrpc)
- [isEIP1559MaxFeePerGas](Sygma.md#iseip1559maxfeepergas)
- [listErc721TokenIdsOfOwner](Sygma.md#listerc721tokenidsofowner)
- [proposalExecutionEventListenerCount](Sygma.md#proposalexecutioneventlistenercount)
- [removeDepositEventListener](Sygma.md#removedepositeventlistener)
- [removeDestinationProposalExecutionEventListener](Sygma.md#removedestinationproposalexecutioneventlistener)
- [removeHomeChainDepositEventListener](Sygma.md#removehomechaindepositeventlistener)
- [removeProposalExecutionEventListener](Sygma.md#removeproposalexecutioneventlistener)
- [selectHomeNetwork](Sygma.md#selecthomenetwork)
- [selectOneForDestination](Sygma.md#selectonefordestination)
- [setDestination](Sygma.md#setdestination)
- [setFeeSettings](Sygma.md#setfeesettings)
- [setHomeWeb3Provider](Sygma.md#sethomeweb3provider)
- [setSelectedToken](Sygma.md#setselectedtoken)
- [toHex](Sygma.md#tohex)
- [waitForTransactionReceipt](Sygma.md#waitfortransactionreceipt)

## Constructors

### constructor

• **new Sygma**(`-`)

**`Name`**

constructor

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `-` | [`Setup`](../modules.md#setup) | bridge setup list in the form of array if you are connecting form browser or bridge setup object if you are using the sdk with Node.js. FeeOracle setup definition |

#### Defined in

[Sygma.ts:74](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L74)

## Properties

### bridgeSetup

• **bridgeSetup**: `undefined` \| [`BridgeData`](../modules.md#bridgedata)

#### Defined in

[Sygma.ts:59](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L59)

___

### bridgeSetupList

• **bridgeSetupList**: `undefined` \| [`EvmBridgeSetupList`](../modules.md#evmbridgesetuplist)

#### Defined in

[Sygma.ts:57](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L57)

___

### bridges

• **bridges**: [`Bridges`](../modules.md#bridges)

#### Defined in

[Sygma.ts:60](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L60)

___

### currentBridge

• `Private` **currentBridge**: `default`

#### Defined in

[Sygma.ts:64](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L64)

___

### ethersProvider

• `Private` **ethersProvider**: [`Provider`](../modules.md#provider) = `undefined`

#### Defined in

[Sygma.ts:58](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L58)

___

### feeOracleSetup

• `Private` `Optional` **feeOracleSetup**: [`FeeOracleData`](../modules.md#feeoracledata)

#### Defined in

[Sygma.ts:65](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L65)

___

### providers

• `Private` **providers**: [`ConnectorProvider`](../modules.md#connectorprovider)

#### Defined in

[Sygma.ts:63](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L63)

___

### selectedToken

• **selectedToken**: `number` = `0`

#### Defined in

[Sygma.ts:66](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L66)

___

### signers

• `Private` **signers**: [`ConnectorSigner`](../modules.md#connectorsigner)

#### Defined in

[Sygma.ts:61](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L61)

___

### tokens

• `Private` **tokens**: [`SygmaErc20Contracts`](../modules.md#sygmaerc20contracts)

#### Defined in

[Sygma.ts:62](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L62)

## Methods

### approve

▸ **approve**(`argument`): `Promise`<`undefined` \| `ContractReceipt`\>

**`Name`**

approve

**`Description`**

approve amount of tokens to spent on home chain

#### Parameters

| Name | Type |
| :------ | :------ |
| `argument` | `Object` |
| `argument.amountOrIdForApproval` | `string` |

#### Returns

`Promise`<`undefined` \| `ContractReceipt`\>

#### Defined in

[Sygma.ts:851](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L851)

___

### approveFeeHandler

▸ **approveFeeHandler**(`«destructured»`): `Promise`<`undefined` \| `ContractReceipt`\>

**`Name`**

approveFeeHandler

**`Description`**

approves to the fee handler

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `amounForApproval` | `string` |

#### Returns

`Promise`<`undefined` \| `ContractReceipt`\>

#### Defined in

[Sygma.ts:903](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L903)

___

### checkCurrentAllowance

▸ **checkCurrentAllowance**(`recipientAddress`): `Promise`<`number`\>

**`Name`**

checkCurrentAllowance

**`Description`**

check the current allowance of the provided address

#### Parameters

| Name | Type |
| :------ | :------ |
| `recipientAddress` | `string` |

#### Returns

`Promise`<`number`\>

#### Defined in

[Sygma.ts:715](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L715)

___

### checkCurrentAllowanceForFeeHandler

▸ **checkCurrentAllowanceForFeeHandler**(`recipientAddress`): `Promise`<`number`\>

**`Name`**

checkCurrentAllowanceForFeeHandler

#### Parameters

| Name | Type |
| :------ | :------ |
| `recipientAddress` | `string` |

#### Returns

`Promise`<`number`\>

#### Defined in

[Sygma.ts:884](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L884)

___

### computeContract

▸ **computeContract**(`config`, `connector`): `Object`

**`Name`**

computeContract

**`Description`**

returns bridge and ERC20 contracts

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`EvmBridgeSetup`](../modules.md#evmbridgesetup) | Sygma bridge config |
| `connector` | `default` | connector object |

#### Returns

`Object`

- object with bridge and ERC20 contracts

| Name | Type |
| :------ | :------ |
| `bridge` | `Bridge` |
| `erc20` | `Erc20Detailed` \| `ERC721MinterBurnerPauser` |

#### Defined in

[Sygma.ts:283](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L283)

___

### computeContracts

▸ `Private` **computeContracts**(): [`SygmaContracts`](../modules.md#sygmacontracts)

**`Name`**

computeERC20Contracts

**`Description`**

computes the sygma contracts

#### Returns

[`SygmaContracts`](../modules.md#sygmacontracts)

#### Defined in

[Sygma.ts:258](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L258)

___

### connectToBridge

▸ `Private` **connectToBridge**(`bridgeAddress`, `signer`): `Bridge`

**`Name`**

connectToBridge

**`Description`**

establish connetion with bridge contract interfacep

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridgeAddress` | `string` |
| `signer` | `undefined` \| `Provider` \| `JsonRpcSigner` |

#### Returns

`Bridge`

#### Defined in

[Sygma.ts:308](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L308)

___

### connectToken

▸ `Private` **connectToken**(`token`, `signer`): `Erc20Detailed` \| `ERC721MinterBurnerPauser`

**`Name`**

connectToken

**`Description`**

connects to token

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | [`TokenConfig`](../modules/EVM.md#tokenconfig) |
| `signer` | [`Provider`](../modules.md#provider) \| `JsonRpcSigner` |

#### Returns

`Erc20Detailed` \| `ERC721MinterBurnerPauser`

#### Defined in

[Sygma.ts:319](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L319)

___

### createDepositEventListener

▸ **createDepositEventListener**(`chain`, `userAddress`): [`BridgeEventCallback`](../modules.md#bridgeeventcallback)

**`Name`**

createDepositEventListener

**`Description`**

creates the deposit events and returns the callback to use

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | [`Directions`](../modules.md#directions) |
| `userAddress` | `string` |

#### Returns

[`BridgeEventCallback`](../modules.md#bridgeeventcallback)

#### Defined in

[Sygma.ts:337](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L337)

___

### createHomeChainDepositEventListener

▸ **createHomeChainDepositEventListener**(`callback`): `Promise`<`Bridge`\>

**`Name`**

createHomeChainDepositEventListener

**`Description`**

creates the homechain deposit event listener

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`destinationDomainId`: `number`, `resourceId`: `string`, `depositNonce`: `BigNumber`, `user`: `string`, `data`: `string`, `handleResponse`: `string`, `tx`: `Event`) => `void` |

#### Returns

`Promise`<`Bridge`\>

#### Defined in

[Sygma.ts:380](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L380)

___

### createProposalExecutionEventListener

▸ **createProposalExecutionEventListener**(`chain`, `homeDepositNonce`): [`BridgeEventCallback`](../modules.md#bridgeeventcallback)

**`Name`**

createProposalExecutionEventListener

**`Description`**

creates the event for proposal execution and returns the callback to use

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | [`Directions`](../modules.md#directions) |
| `homeDepositNonce` | `number` |

#### Returns

[`BridgeEventCallback`](../modules.md#bridgeeventcallback)

#### Defined in

[Sygma.ts:412](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L412)

___

### deposit

▸ **deposit**(`argument`): `Promise`<`undefined` \| `ContractReceipt`\>

**`Name`**

deposit

**`Description`**

make deposit between two networks

#### Parameters

| Name | Type |
| :------ | :------ |
| `argument` | `Object` |
| `argument.amount` | `string` |
| `argument.feeData` | [`FeeDataResult`](../modules.md#feedataresult) |
| `argument.recipientAddress` | `string` |

#### Returns

`Promise`<`undefined` \| `ContractReceipt`\>

#### Defined in

[Sygma.ts:499](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L499)

___

### depositGeneric

▸ **depositGeneric**(`resourceId`, `depositData`, `fee`): `Promise`<`undefined` \| `ContractReceipt`\>

**`Name`**

depositGeneric

**`Description`**

call generic handler to achieve general message passing

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceId` | `string` |
| `depositData` | `string` |
| `fee` | [`FeeDataResult`](../modules.md#feedataresult) |

#### Returns

`Promise`<`undefined` \| `ContractReceipt`\>

#### Defined in

[Sygma.ts:538](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L538)

___

### destinationProposalExecutionEventListener

▸ **destinationProposalExecutionEventListener**(`homeDepositNonce`, `callback`): `Bridge`

**`Name`**

destinationProposalExecutionEventListener

**`Description`**

returns the proposal execution listener

#### Parameters

| Name | Type |
| :------ | :------ |
| `homeDepositNonce` | `number` |
| `callback` | (`originDomainId`: `number`, `depositNonce`: `BigNumber`, `dataHash`: `string`, `tx`: `Event`) => `void` |

#### Returns

`Bridge`

#### Defined in

[Sygma.ts:470](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L470)

___

### fetchBasicFeeData

▸ **fetchBasicFeeData**(`params`): `Promise`<[`FeeDataResult`](../modules.md#feedataresult) \| `Error`\>

**`Name`**

fetchBasicFeeData

**`Description`**

fetch the basic fee data from FeeOracle service

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.amount` | `string` |
| `params.recipientAddress` | `string` |

#### Returns

`Promise`<[`FeeDataResult`](../modules.md#feedataresult) \| `Error`\>

#### Defined in

[Sygma.ts:600](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L600)

___

### fetchFeeData

▸ **fetchFeeData**(`params`): `Promise`<`undefined` \| [`FeeDataResult`](../modules.md#feedataresult) \| `Error`\>

**`Name`**

fetchFeeData

**`Description`**

it fetches the fee data according to bridge setup

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` |  |
| `params.amount` | `string` | the amount of token to transfer |
| `params.recipientAddress` | `string` | receiver of the deposit |

#### Returns

`Promise`<`undefined` \| [`FeeDataResult`](../modules.md#feedataresult) \| `Error`\>

#### Defined in

[Sygma.ts:564](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L564)

___

### fetchFeeOracleData

▸ `Private` **fetchFeeOracleData**(`params`): `Promise`<`undefined` \| [`FeeDataResult`](../modules.md#feedataresult)\>

**`Name`**

fetchFeeOracleData

**`Description`**

fetch the fee oracle data from FeeOracle service

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.amount` | `string` |
| `params.recipientAddress` | `string` |

#### Returns

`Promise`<`undefined` \| [`FeeDataResult`](../modules.md#feedataresult)\>

#### Defined in

[Sygma.ts:639](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L639)

___

### formatPermissionedGenericDepositData

▸ **formatPermissionedGenericDepositData**(`hexMetaData`): `string`

**`Name`**

formatPermissionedGenericDepositData

**`Description`**

formats the data for the permissioned generic data

#### Parameters

| Name | Type |
| :------ | :------ |
| `hexMetaData` | `string` |

#### Returns

`string`

#### Defined in

[Sygma.ts:988](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L988)

___

### formatPermissionlessGenericDepositData

▸ **formatPermissionlessGenericDepositData**(`executeFunctionSignature`, `executeContractAddress`, `maxFee`, `depositor`, `executionData`, `depositorCheck?`): `string`

**`Name`**

formatPermissionlessGenericDepositData

**`Description`**

formats the data for the permissionaless handler

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `executeFunctionSignature` | `string` | `undefined` |
| `executeContractAddress` | `string` | `undefined` |
| `maxFee` | `string` | `undefined` |
| `depositor` | `string` | `undefined` |
| `executionData` | `string` | `undefined` |
| `depositorCheck` | `boolean` | `true` |

#### Returns

`string`

#### Defined in

[Sygma.ts:962](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L962)

___

### getAppoved

▸ **getAppoved**(`tokenId`): `Promise`<`boolean`\>

**`Name`**

getApproved

**`Description`**

returns true if there is an approval over the specified token id

#### Parameters

| Name | Type |
| :------ | :------ |
| `tokenId` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[Sygma.ts:732](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L732)

___

### getBridgeSetup

▸ **getBridgeSetup**(`chain`): [`EvmBridgeSetup`](../modules.md#evmbridgesetup)

**`Name`**

getBridgeSetup

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chain` | ``"chain1"`` \| ``"chain2"`` | chain to select to return the configuration that was passed on intiantiation |

#### Returns

[`EvmBridgeSetup`](../modules.md#evmbridgesetup)

- the current configuration for that chain

#### Defined in

[Sygma.ts:1038](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L1038)

___

### getDepositEventFromReceipt

▸ **getDepositEventFromReceipt**(`depositTx`): `Promise`<`DepositEvent`\>

**`Name`**

getDepositEventFromReceipt

#### Parameters

| Name | Type |
| :------ | :------ |
| `depositTx` | `ContractReceipt` |

#### Returns

`Promise`<`DepositEvent`\>

#### Defined in

[Sygma.ts:929](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L929)

___

### getDestinationChainProvider

▸ **getDestinationChainProvider**(): `JsonRpcProvider`

**`Name`**

getDestinationChainProvider

**`Description`**

returns the RPC provider for destination chain

#### Returns

`JsonRpcProvider`

#### Defined in

[Sygma.ts:1019](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L1019)

___

### getFeeHandlerAddress

▸ **getFeeHandlerAddress**(`signerOrProvider`, `feeRouterAddress`, `domainId`, `resourceId`): `Promise`<`string` \| `Error`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `signerOrProvider` | `Signer` \| `JsonRpcProvider` |
| `feeRouterAddress` | `string` |
| `domainId` | `string` |
| `resourceId` | `string` |

#### Returns

`Promise`<`string` \| `Error`\>

#### Defined in

[Sygma.ts:1074](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L1074)

___

### getFeeRouterAddress

▸ **getFeeRouterAddress**(`chain`): `string`

**`Name`**

getFeeRouterAddress

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chain` | ``"chain1"`` \| ``"chain2"`` | the chain to get the fee router address |

#### Returns

`string`

- the address of the fee router

#### Defined in

[Sygma.ts:1028](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L1028)

___

### getSelectedToken

▸ **getSelectedToken**(): [`TokenConfig`](../modules/EVM.md#tokenconfig)

**`Name`**

getSelectedToken

#### Returns

[`TokenConfig`](../modules/EVM.md#tokenconfig)

#### Defined in

[Sygma.ts:802](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L802)

___

### getSelectedTokenAddress

▸ **getSelectedTokenAddress**(): `string`

**`Name`**

getSelectedTokenAddress

#### Returns

`string`

#### Defined in

[Sygma.ts:794](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L794)

___

### getSigner

▸ **getSigner**(`chain`): [`Signer`](../modules.md#signer)

**`Name`**

getSigner

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | `string` |

#### Returns

[`Signer`](../modules.md#signer)

#### Defined in

[Sygma.ts:1010](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L1010)

___

### getSignerAddress

▸ **getSignerAddress**(`chain`): `Promise`<`undefined` \| `string`\>

**`Name`**

getSignerAddress

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[Sygma.ts:832](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L832)

___

### getSignerBalance

▸ **getSignerBalance**(`chain`): `Promise`<`undefined` \| `BigNumber`\>

**`Name`**

getSignerBalance

**`Description`**

gets the signer balance

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | `string` |

#### Returns

`Promise`<`undefined` \| `BigNumber`\>

#### Defined in

[Sygma.ts:823](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L823)

___

### getSignerGasPrice

▸ **getSignerGasPrice**(`chain`): `Promise`<`undefined` \| `BigNumber`\>

**`Name`**

getSignerGasPrice

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | `string` |

#### Returns

`Promise`<`undefined` \| `BigNumber`\>

#### Defined in

[Sygma.ts:841](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L841)

___

### getTokenBalance

▸ **getTokenBalance**(`erc20Contract`, `address`): `Promise`<`BigNumber`\>

**`Name`**

getTokenBalance

**`Description`**

returns ERC20 token balance

#### Parameters

| Name | Type |
| :------ | :------ |
| `erc20Contract` | `Erc20Detailed` |
| `address` | `string` |

#### Returns

`Promise`<`BigNumber`\>

#### Defined in

[Sygma.ts:813](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L813)

___

### getTokenInfo

▸ **getTokenInfo**(`chain`): `Promise`<{ `balanceOfTokens`: `BigNumber` ; `tokenName`: `string`  }\>

**`Name`**

getTokenInfo

**`Description`**

gets token info from one chain

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | [`Directions`](../modules.md#directions) |

#### Returns

`Promise`<{ `balanceOfTokens`: `BigNumber` ; `tokenName`: `string`  }\>

#### Defined in

[Sygma.ts:761](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L761)

___

### hasTokenSupplies

▸ **hasTokenSupplies**(`amount`): `Promise`<`boolean`\>

**`Name`**

hasTokenSupplies

**`Description`**

check if current token has supplies on destination chain

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `number` |

#### Returns

`Promise`<`boolean`\>

boolean value

#### Defined in

[Sygma.ts:692](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L692)

___

### initializeConnectionFromWeb3Provider

▸ **initializeConnectionFromWeb3Provider**(`web3ProviderInstance`): [`Sygma`](Sygma.md)

**`Name`**

initializeConnectionFromWeb3Provider

**`Description`**

initializes the connection from web3 provider

#### Parameters

| Name | Type |
| :------ | :------ |
| `web3ProviderInstance` | `ExternalProvider` |

#### Returns

[`Sygma`](Sygma.md)

#### Defined in

[Sygma.ts:138](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L138)

___

### initializeConnectionRPC

▸ **initializeConnectionRPC**(`address`): [`Sygma`](Sygma.md)

**`Name`**

initializeConnectionRPC

**`Description`**

initializes RPC connection

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

[`Sygma`](Sygma.md)

#### Defined in

[Sygma.ts:87](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L87)

___

### isEIP1559MaxFeePerGas

▸ **isEIP1559MaxFeePerGas**(`from`): `Promise`<`boolean` \| `BigNumber`\>

**`Name`**

isEIP1559MaxFeePerGas

**`Description`**

check if node is EIP1559

#### Parameters

| Name | Type |
| :------ | :------ |
| `from` | [`Directions`](../modules.md#directions) |

#### Returns

`Promise`<`boolean` \| `BigNumber`\>

#### Defined in

[Sygma.ts:749](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L749)

___

### listErc721TokenIdsOfOwner

▸ **listErc721TokenIdsOfOwner**(`account`): `Promise`<[`string`]\>

**`Name`**

listErc721TokenIdsOfOwner

**`Description`**

list the tokens from the owner

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | `string` |

#### Returns

`Promise`<[`string`]\>

#### Defined in

[Sygma.ts:945](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L945)

___

### proposalExecutionEventListenerCount

▸ **proposalExecutionEventListenerCount**(`chain`): `number`

**`Name`**

proposalExecutionEventListenerCount

**`Description`**

computes the amount of listeners

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | [`Directions`](../modules.md#directions) |

#### Returns

`number`

#### Defined in

[Sygma.ts:444](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L444)

___

### removeDepositEventListener

▸ **removeDepositEventListener**(`chain`): `Bridge`

**`Name`**

removeDepositEventListener

**`Description`**

remove the deposit event

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | [`Directions`](../modules.md#directions) |

#### Returns

`Bridge`

#### Defined in

[Sygma.ts:368](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L368)

___

### removeDestinationProposalExecutionEventListener

▸ **removeDestinationProposalExecutionEventListener**(): `Bridge`

**`Name`**

removeDestinationProposalExecutionEventListener

**`Description`**

removes the destination proposal execution listener

#### Returns

`Bridge`

#### Defined in

[Sygma.ts:487](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L487)

___

### removeHomeChainDepositEventListener

▸ **removeHomeChainDepositEventListener**(): `Bridge`

**`Name`**

removeHomeChainDepositEventListener

**`Description`**

removes the homechain deposit event listener

#### Returns

`Bridge`

#### Defined in

[Sygma.ts:401](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L401)

___

### removeProposalExecutionEventListener

▸ **removeProposalExecutionEventListener**(`chain`): `Bridge`

**`Name`**

removeProposalExecutionEventListener

**`Description`**

removes the proposal execution listener

#### Parameters

| Name | Type |
| :------ | :------ |
| `chain` | [`Directions`](../modules.md#directions) |

#### Returns

`Bridge`

#### Defined in

[Sygma.ts:457](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L457)

___

### selectHomeNetwork

▸ **selectHomeNetwork**(`homeNetworkChainId`): `undefined` \| [`EvmBridgeSetup`](../modules.md#evmbridgesetup)

**`Name`**

selectHomeNetwork

**`Description`**

returns homechain object

#### Parameters

| Name | Type |
| :------ | :------ |
| `homeNetworkChainId` | `number` |

#### Returns

`undefined` \| [`EvmBridgeSetup`](../modules.md#evmbridgesetup)

#### Defined in

[Sygma.ts:118](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L118)

___

### selectOneForDestination

▸ **selectOneForDestination**(`homeNetworkChainId`): `undefined` \| [`EvmBridgeSetup`](../modules.md#evmbridgesetup)

**`Name`**

selectOneForDestination

**`Description`**

returns the destinaton chain object

#### Parameters

| Name | Type |
| :------ | :------ |
| `homeNetworkChainId` | `number` |

#### Returns

`undefined` \| [`EvmBridgeSetup`](../modules.md#evmbridgesetup)

#### Defined in

[Sygma.ts:128](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L128)

___

### setDestination

▸ **setDestination**(`domainId`): [`Sygma`](Sygma.md)

**`Name`**

setDestination

**`Description`**

set destination chain over the sygma instance

#### Parameters

| Name | Type |
| :------ | :------ |
| `domainId` | `string` |

#### Returns

[`Sygma`](Sygma.md)

#### Defined in

[Sygma.ts:222](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L222)

___

### setFeeSettings

▸ **setFeeSettings**(`type`, `address`, `tokenAddress`, `chain`): `void`

**`Name`**

setFeeSettings

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` | the fee settings type: current options are oracle or basic |
| `address` | `string` | address of the fee handler |
| `tokenAddress` | `string` | the token on which the fee settings are being set |
| `chain` | [`Directions`](../modules.md#directions) | the chain on which the token is going to be altered |

#### Returns

`void`

#### Defined in

[Sygma.ts:1049](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L1049)

___

### setHomeWeb3Provider

▸ **setHomeWeb3Provider**(`web3ProviderInstance`, `domainId?`): `Promise`<[`Sygma`](Sygma.md)\>

**`Name`**

setHomeWeb3Provider

**`Description`**

set the web3 provider for homechain

#### Parameters

| Name | Type |
| :------ | :------ |
| `web3ProviderInstance` | `ExternalProvider` |
| `domainId?` | `string` |

#### Returns

`Promise`<[`Sygma`](Sygma.md)\>

#### Defined in

[Sygma.ts:187](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L187)

___

### setSelectedToken

▸ **setSelectedToken**(`address`): `void`

**`Name`**

setSelectedToken

**`Description`**

sets the selectedToken in the Sygma instancep

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`void`

#### Defined in

[Sygma.ts:781](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L781)

___

### toHex

▸ **toHex**(`toConvert`, `padding`): `string`

**`Name`**

toHex

**`Description`**

returns formatted hex data

#### Parameters

| Name | Type |
| :------ | :------ |
| `toConvert` | `string` |
| `padding` | `number` |

#### Returns

`string`

#### Defined in

[Sygma.ts:1001](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L1001)

___

### waitForTransactionReceipt

▸ **waitForTransactionReceipt**(`txHash`): `Promise`<`undefined` \| `TransactionReceipt`\>

**`Name`**

waitForTransactionReceipt

**`Description`**

waits one block for tx receipt

#### Parameters

| Name | Type |
| :------ | :------ |
| `txHash` | `string` |

#### Returns

`Promise`<`undefined` \| `TransactionReceipt`\>

#### Defined in

[Sygma.ts:679](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/Sygma.ts#L679)
