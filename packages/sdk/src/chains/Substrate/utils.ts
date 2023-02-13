import { DefinitionRpcExt } from '@polkadot/types/types';
import { ApiPromise, WsProvider, SubmittableResult } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { keyring as Keyring } from '@polkadot/ui-keyring';
import { isTestChain, BN } from '@polkadot/util';
import { TypeRegistry } from '@polkadot/types/create';
import { ChainType } from '@polkadot/types/interfaces';
import type { Option, u128 } from '@polkadot/types-codec';
import type { AccountData, AssetBalance, DispatchError } from '@polkadot/types/interfaces';

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { SubstrateConfigType, XcmMultiAssetIdType } from '../../types';

const registry = new TypeRegistry();

/**
 * Connects to a Substrate node using WebSockets API by creating a new WsProvider instance with the given socket address.
 *
 * @param {Object} state - An object that contains the state of the API, including the connection status, socket address, and JSON-RPC interface.
 * @param {Object} state.apiState - The connection status of the API.
 * @param {string} state.socket - The WebSockets API address.
 * @param {Object} state.jsonrpc - The JSON-RPC interface of the API.
 * @param {Object} dispatch - A React Dispatch function that dispatches actions to update the API state.
 * @param {string} dispatch.type - The type of action to dispatch.
 * @param {any} dispatch.payload - The payload of the action.
 * @returns {ApiPromise} - An instance of the ApiPromise class.
 */
export const substrateSocketConnect = (
  state: {
    apiState: string;
    socket: string;
    jsonrpc: {
      [x: string]: Record<string, DefinitionRpcExt>;
    };
  },
  dispatch: React.Dispatch<{
    type: string;
    payload: any;
  }>,
): ApiPromise | undefined => {
  const { apiState, socket, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState) return;

  dispatch({ type: 'CONNECT_INIT', payload: undefined });

  // console.log(`Connected socket: ${socket}`);
  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    void _api.isReady.then(() => dispatch({ type: 'CONNECT_SUCCESS', payload: undefined }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS', payload: undefined }));

  _api.on('error', (err: Event) => dispatch({ type: 'CONNECT_ERROR', payload: err }));

  return _api;
};

/**
 * Retrieve the system chain and chain type from the API.
 *
 * @param {ApiPromise} api - The API instance.
 * @returns {Promise<{systemChain: string; systemChainType: ChainType}>} An object with the system chain and chain type.
 */
export const retrieveChainInfo = async (
  api: ApiPromise,
): Promise<{
  systemChain: string;
  systemChainType: ChainType;
}> => {
  const [systemChain, systemChainType] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.chainType
      ? api.rpc.system.chainType()
      : Promise.resolve(registry.createType('ChainType', 'Live') as unknown as ChainType),
  ]);

  return {
    systemChain: (systemChain || '<unknown>').toString(),
    systemChainType,
  };
};

/**
 * Loads all accounts from web3 and sets them in the Keyring.
 *
 * @param {SubstrateConfigType} config - Substrate sygmabridge config.
 * @param {Object} state - The state object containing the api.
 * @param {Function} dispatch - The dispatch function to update the store.
 * @returns {Promise<void>} Promise that resolves when accounts are loaded.
 */
export const loadAccounts = async (
  config: SubstrateConfigType,
  state: { api: ApiPromise },
  dispatch: React.Dispatch<{
    type: string;
    payload: any;
  }>,
): Promise<void> => {
  const { api } = state;
  dispatch({ type: 'LOAD_KEYRING', payload: undefined });
  try {
    await web3Enable(config.appName);
    let allAccounts = await web3Accounts();
    allAccounts = allAccounts.map(({ address, meta }) => ({
      address,
      meta: { ...meta, name: `${meta.name ?? 'no name'} (${meta.source})` },
    }));

    /**
     * Logics to check if the connecting chain is a dev chain, coming from polkadot-js Apps
     * @link https://github.com/polkadot-js/apps/blob/15b8004b2791eced0dde425d5dc7231a5f86c682/packages/react-api/src/Api.tsx?_pjax=div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20%3E%20main#L101-L110
     */
    const { systemChain, systemChainType } = await retrieveChainInfo(api);
    const isDevelopment =
      systemChainType.isDevelopment || systemChainType.isLocal || isTestChain(systemChain);
    Keyring.loadAll({ isDevelopment }, allAccounts);

    dispatch({ type: 'SET_KEYRING', payload: Keyring });
  } catch (e) {
    console.error(e);
    dispatch({ type: 'KEYRING_ERROR', payload: undefined });
  }
};

/**
 * Retrieves the basic fee for a given domain and asset.
 *
 * @param {ApiPromise} api - The Substrate API instance.
 * @param {number} domainId - The ID of the domain.
 * @param {Object} xcmMultiAssetId - The XCM MultiAsset ID of the asset. {@link {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset}|More details}
 * @returns {Promise<Option<u128>>} A promise that resolves to an Option containing the basic fee as u128, or None if not found.
 */
export const getBasicFee = async (
  api: ApiPromise,
  domainId: number,
  xcmMultiAssetId: Object,
): Promise<Option<u128>> => {
  const feeRes = (await api.query.sygmaBasicFeeHandler.assetFees([
    domainId,
    xcmMultiAssetId,
  ])) as unknown as Option<u128>;
  return feeRes;
};

/**
 * Retrieves balance value in native tokens of the network
 *
 * @param {ApiPromise} api - An ApiPromise instance.
 * @param {InjectedAccountWithMeta} currentAccount - The current account.
 * @returns {Promise<AccountData>} A promise that resolves to a AccountData.
 */
export const getNativeTokenBalance = async (
  api: ApiPromise,
  currentAccount: InjectedAccountWithMeta,
): Promise<AccountData> => {
  const balance: unknown = await api.query.system.account(currentAccount.address);
  return balance as AccountData;
};

/**
 * Retrieves the asset balance of a given account.
 *
 * @param {ApiPromise} api - The API instance used to query the chain.
 * @param {number} assetId - The ID of the asset to query. {@link {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset}|More details}
 * @param {InjectedAccountWithMeta} currentAccount - The account from which to retrieve the asset balance.
 * @returns {Promise<AssetBalance>} A promise that resolves with the retrieved asset balance.
 */
export const getAssetBalance = async (
  api: ApiPromise,
  assetId: number,
  currentAccount: InjectedAccountWithMeta,
): Promise<AssetBalance> => {
  const assetRes = await api.query.assets.account(assetId, currentAccount.address);
  return assetRes as AssetBalance;
};

/**
 * Calculates a big number from an amount and chain decimals retrived from API.
 *
 * @param {ApiPromise} api - An API Promise object.
 * @param {string} amount - The amount to be converted.
 * @returns {BN} The converted amount as a BN object.
 */
export const calculateBigNumber = (api: ApiPromise, amount: string): BN => {
  const bnAmount = new BN(Number(amount));
  const bnBase = new BN(10);
  const bnDecimals = new BN(api.registry.chainDecimals[0]);
  const convertAmount = bnAmount.mul(bnBase.pow(bnDecimals));
  return convertAmount;
};

/**
 * Throw errors from a SubmittableResult.
 *
 * @param {ApiPromise} api - The ApiPromise instance used to find meta errors.
 * @param {SubmittableResult} result - The SubmittableResult to log errors from.
 * @param {() => void} unsub - A function to stop listen for events.
 */
export const throwErrorIfAny = (
  api: ApiPromise,
  result: SubmittableResult,
  unsub: () => void,
): void => {
  const { events = [], status } = result;
  if (status.isInBlock || status.isFinalized) {
    events
      // find/filter for failed events
      .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
      // we know that data for system.ExtrinsicFailed is
      // (DispatchError, DispatchInfo)
      .forEach(({ event: { data } }) => {
        const error = data[0] as DispatchError;
        unsub(); // unsubscribe from subscription
        if (error.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = api.registry.findMetaError(error.asModule);
          const { docs, method, section } = decoded;

          throw new Error(`${section}.${method}: ${docs.join(' ')}`);
        } else {
          // Other, CannotLookup, BadOrigin, no extra info
          throw new Error(error.toString());
        }
      }); // end of forEach loop
  } // end of if statement
};

/**
 * Handles the transaction extrinsic result.
 *
 * @param {ApiPromise} api - The API promise object.
 * @param {SubmittableResult} result - The submittable result object.
 * @param {React.Dispatch<{type: string; payload: any;}>} dispatch - The dispatch function to update the state of the application.
 * @param {Function} unsub - A function to stop listen for events.
 */
export const handleTxExtrinsicResult = (
  api: ApiPromise,
  result: SubmittableResult,
  dispatch: React.Dispatch<{
    type: string;
    payload: any;
  }>,
  unsub: () => void,
): void => {
  const { status } = result;
  console.log(`Current status is ${status.toString()}`);

  // if error find in events log the error and unsubsribe
  throwErrorIfAny(api, result, unsub);

  if (status.isInBlock) {
    console.log(`Transaction included at blockHash ${status.asInBlock.toString()}`);
    dispatch({ type: 'SET_TRANSFER_STATUS', payload: 'In block' });

    dispatch({
      type: 'SET_TRANSFER_STATUS_BLOCK',
      payload: status.asInBlock.toString(),
    });
  } else if (status.isFinalized) {
    console.log(`Transaction finalized at blockHash ${status.asFinalized.toString()}`);
    dispatch({ type: 'SET_TRANSFER_STATUS', payload: 'Finalized' });

    dispatch({
      type: 'SET_TRANSFER_STATUS_BLOCK',
      payload: status.asFinalized.toString(),
    });
    unsub();
  }
};

/**
 * Deposit function
 *
 * @description Performs a deposit transaction on the Sygna Bridge.
 * @param {ApiPromise} api - The ApiPromise instance.
 * @param {InjectedAccountWithMeta} currentAccount - The current account instance.
 * @param {XcmMultiAssetIdType} xcmMultiAssetId - The XCM multi-asset ID type.
 * @param {string} amount - The amount to be deposited.
 * @param {string} domainId - The domain ID of the destination address.
 * @param {string} address - The destination address of the deposit transaction.
 * @param {React.Dispatch<{type: string; payload: any;}>} dispatch - A dispatch function for sending payloads to the store.
 */
export const deposit = async (
  api: ApiPromise,
  currentAccount: InjectedAccountWithMeta,
  xcmMultiAssetId: XcmMultiAssetIdType,
  amount: string,
  domainId: string,
  address: string,
  dispatch: React.Dispatch<{
    type: string;
    payload: any;
  }>,
): Promise<void> => {
  const convertedAmount = calculateBigNumber(api, amount);

  const xcmV1MultiassetFungibility = { fungible: convertedAmount.toString() };

  const destIdMultilocation = {
    parents: 0,
    interior: {
      x2: [{ generalKey: address }, { generalIndex: domainId }],
    },
  };
  const asset = { id: xcmMultiAssetId, fun: xcmV1MultiassetFungibility };

  try {
    // finds an injector for an address
    const injector = await web3FromAddress(currentAccount.address);

    const unsub = await api.tx.sygmaBridge
      .deposit(asset, destIdMultilocation)
      .signAndSend(currentAccount.address, { signer: injector.signer }, result => {
        handleTxExtrinsicResult(api, result, dispatch, unsub);
      });
  } catch (e) {
    console.error('Deposit error', e);
  }
};
