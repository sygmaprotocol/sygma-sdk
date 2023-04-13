[@buildwithsygma/sygma-sdk-core](README.md) / Exports

# @buildwithsygma/sygma-sdk-core

## Table of contents

### Namespaces

- [EVM](modules/EVM.md)
- [Substrate](modules/Substrate.md)

### Classes

- [Sygma](classes/Sygma.md)

### Interfaces

- [SygmaSDK](interfaces/SygmaSDK.md)

### Type Aliases

- [BridgeData](modules.md#bridgedata)
- [BridgeEventCallback](modules.md#bridgeeventcallback)
- [BridgeEvents](modules.md#bridgeevents)
- [Bridges](modules.md#bridges)
- [ChainbridgeEventsObject](modules.md#chainbridgeeventsobject)
- [ConnectionEvents](modules.md#connectionevents)
- [ConnectorProvider](modules.md#connectorprovider)
- [ConnectorSigner](modules.md#connectorsigner)
- [Directions](modules.md#directions)
- [Events](modules.md#events)
- [EvmBridgeSetup](modules.md#evmbridgesetup)
- [EvmBridgeSetupList](modules.md#evmbridgesetuplist)
- [FeeDataResult](modules.md#feedataresult)
- [FeeOracleData](modules.md#feeoracledata)
- [OracleResource](modules.md#oracleresource)
- [Provider](modules.md#provider)
- [Setup](modules.md#setup)
- [Signer](modules.md#signer)
- [SygmaContracts](modules.md#sygmacontracts)
- [SygmaErc20Contracts](modules.md#sygmaerc20contracts)
- [SygmaProviders](modules.md#sygmaproviders)

### Functions

- [computeBridges](modules.md#computebridges)
- [computeERC20Contracts](modules.md#computeerc20contracts)
- [computeProvidersAndSignersRPC](modules.md#computeprovidersandsignersrpc)
- [computeProvidersAndSignersWeb3](modules.md#computeprovidersandsignersweb3)
- [listTokensOfOwner](modules.md#listtokensofowner)
- [processAmountForERC20Transfer](modules.md#processamountforerc20transfer)
- [processLenRecipientAddress](modules.md#processlenrecipientaddress)
- [setConnectorRPC](modules.md#setconnectorrpc)
- [setConnectorWeb3](modules.md#setconnectorweb3)

## Type Aliases

### BridgeData

Ƭ **BridgeData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `chain1` | [`EvmBridgeSetup`](modules.md#evmbridgesetup) |
| `chain2` | [`EvmBridgeSetup`](modules.md#evmbridgesetup) |

#### Defined in

[types/types.ts:39](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L39)

___

### BridgeEventCallback

Ƭ **BridgeEventCallback**: (`fn`: (...`params`: `any`) => `void`) => `Bridge`

#### Type declaration

▸ (`fn`): `Bridge`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (...`params`: `any`) => `void` |

##### Returns

`Bridge`

#### Defined in

[types/types.ts:76](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L76)

___

### BridgeEvents

Ƭ **BridgeEvents**: { `feeHandler`: `string`  } \| `undefined`

#### Defined in

[types/types.ts:84](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L84)

___

### Bridges

Ƭ **Bridges**: { `[chain: string]`: `Bridge` \| `undefined`;  } \| `undefined`

#### Defined in

[types/types.ts:70](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L70)

___

### ChainbridgeEventsObject

Ƭ **ChainbridgeEventsObject**: { `[chain: string]`: [`BridgeEventCallback`](modules.md#bridgeeventcallback);  } \| `undefined`

#### Defined in

[types/types.ts:78](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L78)

___

### ConnectionEvents

Ƭ **ConnectionEvents**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `chain1` | [`BridgeEvents`](modules.md#bridgeevents) |
| `chain2` | [`BridgeEvents`](modules.md#bridgeevents) |

#### Defined in

[types/types.ts:90](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L90)

___

### ConnectorProvider

Ƭ **ConnectorProvider**: `Record`<``"chain1"`` \| ``"chain2"``, [`Provider`](modules.md#provider)\> \| `undefined`

#### Defined in

[types/types.ts:119](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L119)

___

### ConnectorSigner

Ƭ **ConnectorSigner**: `Record`<``"chain1"`` \| ``"chain2"``, [`Signer`](modules.md#signer)\> \| `undefined`

#### Defined in

[types/types.ts:117](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L117)

___

### Directions

Ƭ **Directions**: ``"chain1"`` \| ``"chain2"``

#### Defined in

[types/types.ts:12](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L12)

___

### Events

Ƭ **Events**: { `chain1`: [`BridgeEvents`](modules.md#bridgeevents) ; `chain2`: [`BridgeEvents`](modules.md#bridgeevents)  } \| `undefined`

#### Defined in

[types/types.ts:95](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L95)

___

### EvmBridgeSetup

Ƭ **EvmBridgeSetup**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bridgeAddress` | `string` |
| `confirmations?` | `number` |
| `decimals` | `number` |
| `domainId` | `string` |
| `erc20HandlerAddress` | `string` |
| `erc721HandlerAddress` | `string` |
| `feeHandlers` | { `address`: `string` ; `type`: ``"basic"`` \| ``"oracle"``  }[] |
| `feeOracleHandlerAddress?` | `string` |
| `feeRouterAddress` | `string` |
| `name` | `string` |
| `networkId` | `number` |
| `rpcUrl` | `string` |
| `tokens` | [`TokenConfig`](modules/EVM.md#tokenconfig)[] |
| `type` | ``"Ethereum"`` |

#### Defined in

[types/types.ts:20](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L20)

___

### EvmBridgeSetupList

Ƭ **EvmBridgeSetupList**: [`EvmBridgeSetup`](modules.md#evmbridgesetup)[]

#### Defined in

[types/types.ts:37](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L37)

___

### FeeDataResult

Ƭ **FeeDataResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `calculatedRate` | `string` |
| `erc20TokenAddress` | `string` |
| `fee` | `ethers.BigNumber` |
| `feeData` | `string` |
| `type` | [`FeeType`](modules/EVM.md#feetype) |

#### Defined in

[types/types.ts:62](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L62)

___

### FeeOracleData

Ƭ **FeeOracleData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `feeOracleBaseUrl` | `string` |

#### Defined in

[types/types.ts:44](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L44)

___

### OracleResource

Ƭ **OracleResource**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `baseEffectiveRate` | `string` |
| `dataTimestamp` | `number` |
| `dstGasPrice` | `string` |
| `expirationTimestamp` | `number` |
| `fromDomainID` | `number` |
| `msgGasLimit` | `string` |
| `resourceID` | `string` |
| `signature` | `string` |
| `signatureTimestamp` | `number` |
| `toDomainID` | `number` |
| `tokenEffectiveRate` | `string` |

#### Defined in

[types/types.ts:48](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L48)

___

### Provider

Ƭ **Provider**: `ethers.providers.Provider` \| `undefined`

#### Defined in

[types/types.ts:113](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L113)

___

### Setup

Ƭ **Setup**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bridgeSetup?` | [`BridgeData`](modules.md#bridgedata) |
| `bridgeSetupList` | [`EvmBridgeSetupList`](modules.md#evmbridgesetuplist) |
| `feeOracleSetup?` | [`FeeOracleData`](modules.md#feeoracledata) |

#### Defined in

[types/types.ts:14](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L14)

___

### Signer

Ƭ **Signer**: `ethers.providers.JsonRpcSigner` \| `undefined`

#### Defined in

[types/types.ts:115](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L115)

___

### SygmaContracts

Ƭ **SygmaContracts**: `Object`

#### Index signature

▪ [chain: `string`]: { `bridge`: `Bridge` ; `erc20`: `Erc20Detailed`  }

#### Defined in

[types/types.ts:72](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L72)

___

### SygmaErc20Contracts

Ƭ **SygmaErc20Contracts**: { `[chain: string]`: `Erc20Detailed` \| `ERC721MinterBurnerPauser` \| `undefined`;  } \| `undefined`

#### Defined in

[types/types.ts:109](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L109)

___

### SygmaProviders

Ƭ **SygmaProviders**: `Object`

#### Index signature

▪ [chain: `string`]: { `provider`: `ethers.providers.JsonRpcProvider` \| [`Provider`](modules.md#provider) ; `signer`: `ethers.providers.JsonRpcSigner` \| [`Signer`](modules.md#signer)  }

#### Defined in

[types/types.ts:102](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/types/types.ts#L102)

## Functions

### computeBridges

▸ **computeBridges**(`contracts`): [`Bridges`](modules.md#bridges)

**`Deprecated`**

since version 1.4.0

**`Name`**

computeBridges

**`Description`**

returns object with contracts sorted by chain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contracts` | [`SygmaContracts`](modules.md#sygmacontracts) | object with contracts |

#### Returns

[`Bridges`](modules.md#bridges)

#### Defined in

[utils/index.ts:14](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L14)

___

### computeERC20Contracts

▸ **computeERC20Contracts**(`contracts`): [`SygmaErc20Contracts`](modules.md#sygmaerc20contracts)

**`Deprecated`**

since version 1.4.0

**`Name`**

computeERC20Contracts

**`Description`**

returns object with ERC20 contracts sorted by chain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contracts` | [`SygmaContracts`](modules.md#sygmacontracts) | object with contracts |

#### Returns

[`SygmaErc20Contracts`](modules.md#sygmaerc20contracts)

#### Defined in

[utils/index.ts:32](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L32)

___

### computeProvidersAndSignersRPC

▸ **computeProvidersAndSignersRPC**(`bridgeSetup`, `address?`): [`SygmaProviders`](modules.md#sygmaproviders)

**`Deprecated`**

since version 1.4.0

**`Name`**

computeProvidersAndSignersRPC

**`Description`**

returns object with RPC provider sorted by chain1 and chain2 descriptors

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridgeSetup` | [`BridgeData`](modules.md#bridgedata) | bridge data defined to use the SDK |
| `address?` | `string` | account address |

#### Returns

[`SygmaProviders`](modules.md#sygmaproviders)

#### Defined in

[utils/index.ts:51](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L51)

___

### computeProvidersAndSignersWeb3

▸ **computeProvidersAndSignersWeb3**(`bridgeSetup`, `web3providerInstance`): [`SygmaProviders`](modules.md#sygmaproviders)

**`Deprecated`**

since version 1.4.0

**`Name`**

computeProvidersAndSignersWeb3

**`Description`**

returns object with Web3 providers sorted by chain1 and chain2 descriptors

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bridgeSetup` | [`BridgeData`](modules.md#bridgedata) | bridge setup to use the SDK |
| `web3providerInstance` | `ExternalProvider` | web3 provider instance |

#### Returns

[`SygmaProviders`](modules.md#sygmaproviders)

#### Defined in

[utils/index.ts:69](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L69)

___

### listTokensOfOwner

▸ **listTokensOfOwner**(`«destructured»`): `Promise`<[`string`]\>

**`Deprecated`**

since version 1.4.0

**`Name`**

listTokensOfOwner

**`Description`**

list the tokens of the account

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `account` | `string` |
| › `signer` | `Provider` \| `JsonRpcSigner` |
| › `token` | `string` |

#### Returns

`Promise`<[`string`]\>

#### Defined in

[utils/index.ts:133](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L133)

___

### processAmountForERC20Transfer

▸ **processAmountForERC20Transfer**(`amount`): `string`

**`Deprecated`**

since version 1.4.0

**`Name`**

processAmountForERC20Transfer

**`Description`**

prepares the amount of data to tranfer for ERC20 token

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `string` |

#### Returns

`string`

#### Defined in

[utils/index.ts:108](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L108)

___

### processLenRecipientAddress

▸ **processLenRecipientAddress**(`recipientAddress`): `string`

**`Deprecated`**

since version 1.4.0

**`Name`**

processLenRecipientAddress

**`Description`**

returns hex data of the recipient address

#### Parameters

| Name | Type |
| :------ | :------ |
| `recipientAddress` | `string` |

#### Returns

`string`

#### Defined in

[utils/index.ts:121](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L121)

___

### setConnectorRPC

▸ **setConnectorRPC**(`rpcUrl`, `address?`): `default`

**`Deprecated`**

since version 1.4.0

**`Name`**

setConnectorRPC

**`Description`**

connects to RPC node

#### Parameters

| Name | Type |
| :------ | :------ |
| `rpcUrl` | `string` |
| `address?` | `string` |

#### Returns

`default`

#### Defined in

[utils/index.ts:87](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L87)

___

### setConnectorWeb3

▸ **setConnectorWeb3**(`web3ProviderInstance`): `default`

**`Name`**

setConnectorWeb3

**`Description`**

connects to web3 RCP

#### Parameters

| Name | Type |
| :------ | :------ |
| `web3ProviderInstance` | `ExternalProvider` |

#### Returns

`default`

#### Defined in

[utils/index.ts:97](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/utils/index.ts#L97)
