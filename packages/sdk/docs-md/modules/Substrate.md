[@buildwithsygma/sygma-sdk-core](../README.md) / [Exports](../modules.md) / Substrate

# Namespace: Substrate

## Table of contents

### Type Aliases

- [DepositCallbacksType](Substrate.md#depositcallbackstype)
- [DepositEventDataType](Substrate.md#depositeventdatatype)
- [SubstrateSocketConnectionCallbacksType](Substrate.md#substratesocketconnectioncallbackstype)
- [XcmMultiAssetIdType](Substrate.md#xcmmultiassetidtype)

### Bridge deposit Functions

- [calculateBigNumber](Substrate.md#calculatebignumber)
- [createDestIdMultilocationData](Substrate.md#createdestidmultilocationdata)
- [createMultiAssetData](Substrate.md#createmultiassetdata)
- [deposit](Substrate.md#deposit)
- [handleTxExtrinsicResult](Substrate.md#handletxextrinsicresult)
- [throwErrorIfAny](Substrate.md#throwerrorifany)

### Event handling Functions

- [listenForEvent](Substrate.md#listenforevent)

### Fee Functions

- [getBasicFee](Substrate.md#getbasicfee)

### Token iteractions Functions

- [getAssetBalance](Substrate.md#getassetbalance)
- [getNativeTokenBalance](Substrate.md#getnativetokenbalance)

### Helpers Functions

- [substrateSocketConnect](Substrate.md#substratesocketconnect)

## Type Aliases

### DepositCallbacksType

Ƭ **DepositCallbacksType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `onDepositEvent?` | (`data`: [`DepositEventDataType`](Substrate.md#depositeventdatatype)) => `void` |
| `onError?` | (`error`: `unknown`) => `void` |
| `onFinalized?` | (`status`: `ExtrinsicStatus`) => `void` |
| `onInBlock?` | (`status`: `ExtrinsicStatus`) => `void` |

#### Defined in

[chains/Substrate/utils/depositFns.ts:19](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L19)

___

### DepositEventDataType

Ƭ **DepositEventDataType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `depositData` | `string` |
| `depositNonce` | `string` |
| `destDomainId` | `string` |
| `handlerResponse` | `string` |
| `resourceId` | `string` |
| `sender` | `string` |
| `transferType` | `string` |

#### Defined in

[chains/Substrate/utils/depositFns.ts:9](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L9)

___

### SubstrateSocketConnectionCallbacksType

Ƭ **SubstrateSocketConnectionCallbacksType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `onConnect?` | (`api`: `ApiPromise`) => `void` |
| `onConnectError?` | (`error`: `Event`) => `void` |
| `onConnectInit?` | () => `void` |
| `onConnectSucccess?` | (`api`: `ApiPromise`) => `void` |

#### Defined in

[chains/Substrate/utils/substrateSocketConnect.ts:4](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/substrateSocketConnect.ts#L4)

___

### XcmMultiAssetIdType

Ƭ **XcmMultiAssetIdType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `concrete` | { `interior`: { `x3`: ({ `parachain`: `number`  } \| { `generalKey`: `string`  })[]  } ; `parents`: `number`  } |
| `concrete.interior` | { `x3`: ({ `parachain`: `number`  } \| { `generalKey`: `string`  })[]  } |
| `concrete.interior.x3` | ({ `parachain`: `number`  } \| { `generalKey`: `string`  })[] |
| `concrete.parents` | `number` |

#### Defined in

[chains/Substrate/types/index.ts:1](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/types/index.ts#L1)

## Bridge deposit Functions

### calculateBigNumber

▸ **calculateBigNumber**(`api`, `amount`): `BN`

Calculates a big number from an amount and chain decimals retrived from API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | An API Promise object. |
| `amount` | `string` | The amount to be converted. |

#### Returns

`BN`

The converted amount as a BN object.

#### Defined in

[chains/Substrate/utils/depositFns.ts:46](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L46)

___

### createDestIdMultilocationData

▸ **createDestIdMultilocationData**(`address`, `domainId`): `object`

Creates a destination multilocation object for the deposit transaction.

**`Example`**

```ts
// Create a destination multilocation object
const address = '0x123abc';
const domainId = '42';
const multilocationData = createDestIdMultilocationData(address, domainId);
console.log(multilocationData);
// Output: {
//   parents: 0,
//   interior: {
//     x2: [
//       { generalKey: '0x123abc' },
//       { generalKey: '0x2a' }
//     ]
//   }
// }
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The recipient address. |
| `domainId` | `string` | The domain identifier. |

#### Returns

`object`

- The destination multilocation object.

#### Defined in

[chains/Substrate/utils/depositFns.ts:162](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L162)

___

### createMultiAssetData

▸ **createMultiAssetData**(`xcmMultiAssetId`, `api`, `amount`): `object`

Creates an MultiAsset data for the deposit transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `xcmMultiAssetId` | [`XcmMultiAssetIdType`](Substrate.md#xcmmultiassetidtype) | The XCM multi-asset identifier. |
| `api` | `ApiPromise` | The Polkadot API promise object. |
| `amount` | `string` | The deposit amount. |

#### Returns

`object`

- The asset object.

#### Defined in

[chains/Substrate/utils/depositFns.ts:178](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L178)

___

### deposit

▸ **deposit**(`api`, `xcmMultiAssetId`, `amount`, `domainId`, `address`): `SubmittableExtrinsic`<``"promise"``, `SubmittableResult`\>

Performs a deposit extrinsic transaction

**`Example`**

```ts
const injector = await web3FromAddress(currentAccount.address);
const unsub = await deposit(api, asset, amount, domainId, address)
  .signAndSend(currentAccount.address, { signer: injector.signer }, result => {
     handleTxExtrinsicResult(api, result, unsub, callbacks);
   });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | The ApiPromise instance. |
| `xcmMultiAssetId` | [`XcmMultiAssetIdType`](Substrate.md#xcmmultiassetidtype) | The XCM multi-asset ID type. |
| `amount` | `string` | The amount to be deposited. |
| `domainId` | `string` | The domain ID of the destination address. |
| `address` | `string` | The destination address of the deposit transaction. |

#### Returns

`SubmittableExtrinsic`<``"promise"``, `SubmittableResult`\>

- A SubmittableExtrinsic representing the deposit transaction.

#### Defined in

[chains/Substrate/utils/depositFns.ts:207](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L207)

___

### handleTxExtrinsicResult

▸ **handleTxExtrinsicResult**(`api`, `result`, `unsub`, `callbacks?`): `void`

Handles the transaction extrinsic result.

**`Example`**

```ts
handleTxExtrinsicResult(api, result, unsub, {
  onInBlock: (status) => console.log('Transaction in block:', status),
  onDepositEvent: (data) => console.log('Deposit event data:', data),
  onFinalized: (status) => console.log('Transaction finalized:', status),
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | The API promise object. |
| `result` | `SubmittableResult` | The submittable result object. |
| `unsub` | () => `void` | A function to stop listen for events. |
| `callbacks?` | [`DepositCallbacksType`](Substrate.md#depositcallbackstype) | Optional callbacks for success and error cases. |

#### Returns

`void`

#### Defined in

[chains/Substrate/utils/depositFns.ts:107](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L107)

___

### throwErrorIfAny

▸ **throwErrorIfAny**(`api`, `result`, `unsub`): `void`

Throw errors from a SubmittableResult.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | The ApiPromise instance used to find meta errors. |
| `result` | `SubmittableResult` | The SubmittableResult to log errors from. |
| `unsub` | () => `void` | A function to stop listen for events. |

#### Returns

`void`

#### Defined in

[chains/Substrate/utils/depositFns.ts:62](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/depositFns.ts#L62)

___

## Event handling Functions

### listenForEvent

▸ **listenForEvent**(`api`, `eventName`, `callback`): `Promise`<`undefined` \| () => `void`\>

Listens for an event and calls a callback when it is triggered.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | An ApiPromise instance. |
| `eventName` | `string` | The name of the event to listen for. |
| `callback` | (`data`: `AnyJson`) => `void` | The function to call when the event is triggered. |

#### Returns

`Promise`<`undefined` \| () => `void`\>

A promise that resolves when the event is triggered.

#### Defined in

[chains/Substrate/utils/listenForEvent.ts:14](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/listenForEvent.ts#L14)

___

## Fee Functions

### getBasicFee

▸ **getBasicFee**(`api`, `domainId`, `xcmMultiAssetId`): `Promise`<`Option`<`u128`\>\>

Retrieves the basic fee for a given domainId and asset.

**`Example`**

```ts
// Assuming the api instance is already connected and ready to use
const domainId = 1;
const xcmMultiAssetId = {...} // XCM MultiAsset ID of the asset
getBasicFee(api, domainId, xcmMultiAssetId)
  .then((basicFee) => {
    if (basicFee.isSome()) {
      console.log('Basic fee:', basicFee.unwrap().toString());
    } else {
      console.log('Basic fee not found');
    }
  })
  .catch((error) => {
    console.error('Error fetching basic fee:', error);
  });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | The Substrate API instance. |
| `domainId` | `number` | The ID of the domain. |
| `xcmMultiAssetId` | `Object` | The XCM MultiAsset ID of the asset. [More details](https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset) |

#### Returns

`Promise`<`Option`<`u128`\>\>

A promise that resolves to an Option containing the basic fee as u128, or None if not found.

#### Defined in

[chains/Substrate/utils/getBasicFee.ts:29](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/getBasicFee.ts#L29)

___

## Token iteractions Functions

### getAssetBalance

▸ **getAssetBalance**(`api`, `assetId`, `currentAccount`): `Promise`<`AssetBalance`\>

Retrieves the asset balance of a given account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | The API instance used to query the chain. |
| `assetId` | `number` | The ID of the asset to query. [More details](https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset) |
| `currentAccount` | `InjectedAccountWithMeta` | The account from which to retrieve the asset balance. |

#### Returns

`Promise`<`AssetBalance`\>

A promise that resolves with the retrieved asset balance.

#### Defined in

[chains/Substrate/utils/getAssetBalance.ts:16](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/getAssetBalance.ts#L16)

___

### getNativeTokenBalance

▸ **getNativeTokenBalance**(`api`, `currentAccount`): `Promise`<`AccountData`\>

Retrieves balance value in native tokens of the network

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | `ApiPromise` | An ApiPromise instance. |
| `currentAccount` | `InjectedAccountWithMeta` | The current account. |

#### Returns

`Promise`<`AccountData`\>

A promise that resolves to a AccountData.

#### Defined in

[chains/Substrate/utils/getNativeTokenBalance.ts:14](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/getNativeTokenBalance.ts#L14)

___

## Helpers Functions

### substrateSocketConnect

▸ **substrateSocketConnect**(`state`, `callbacks?`): `undefined` \| `ApiPromise`

Connects to a Substrate node using WebSockets API by creating a new WsProvider instance with the given socket address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | `Object` | An object that contains the state of the API, including the connection status, socket address, and JSON-RPC interface. |
| `state.apiState` | `undefined` \| ``null`` \| `string` | - |
| `state.jsonrpc` | `Object` | - |
| `state.socket` | `string` | - |
| `callbacks?` | [`SubstrateSocketConnectionCallbacksType`](Substrate.md#substratesocketconnectioncallbackstype) | Optional callbacks |

#### Returns

`undefined` \| `ApiPromise`

- An instance of the ApiPromise class.

#### Defined in

[chains/Substrate/utils/substrateSocketConnect.ts:30](https://github.com/sygmaprotocol/sygma-sdk/blob/c1c5a2f/packages/sdk/src/chains/Substrate/utils/substrateSocketConnect.ts#L30)
