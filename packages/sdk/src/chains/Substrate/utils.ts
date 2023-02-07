import { DefinitionRpcExt } from '@polkadot/types/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { keyring as Keyring } from '@polkadot/ui-keyring';
import { isTestChain, BN } from '@polkadot/util';
import { TypeRegistry } from '@polkadot/types/create';
import { ChainType } from '@polkadot/types/interfaces';
import type { Option, u128 } from '@polkadot/types-codec';
import type { AccountData, AssetBalance } from '@polkadot/types/interfaces';

import type { Codec } from '@polkadot/types-codec/types';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { SubstrateConfigType } from '../../types';

const registry = new TypeRegistry();

/**
 * Connects to a Substrate node using WebSockets API by creating a new WsProvider instance with the given socket address.
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

///
// Loading accounts from dev acrnd polkadot-js extension

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
    await web3Enable(config.APP_NAME);
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
 * @param {Object} xcmMultiAssetId - The XCM MultiAsset ID of the asset.
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

export const getAssetBalance = async (
  api: ApiPromise,
  assetId: number,
  currentAccount: InjectedAccountWithMeta,
): Promise<AssetBalance> => {
  const assetRes = await api.query.assets.account(assetId, currentAccount.address);
  return assetRes as AssetBalance;
};

export const deposit = async (
  config: SubstrateConfigType,
  api: ApiPromise,
  currentAccount: InjectedAccountWithMeta,
  {
    amount,
    domainId,
    address,
  }: {
    amount: BN;
    domainId: string;
    address: string;
  },
): Promise<void> => {
  console.log(amount.toNumber().toString());
  const xsmMultiAssetId = {
    concrete: {
      parents: 1,
      interior: {
        x3: [{ parachain: 2004 }, { generalKey: '0x7379676d61' }, { generalKey: '0x75736463' }],
      },
    },
  };
  const xcmV1MultiassetFungibility = { fungible: amount.toNumber().toString() };

  const destIdMultilocation = {
    parents: 0,
    interior: {
      x2: [{ generalKey: address }, { generalIndex: domainId }],
    },
  };

  // (this needs to be called first, before other requests)
  const _allInjected = await web3Enable(config.APP_NAME);
  console.log(currentAccount);
  // finds an injector for an address
  const injector = await web3FromAddress(currentAccount.address);
  const unsub = await api.tx.sygmaBridge
    .deposit({ id: xsmMultiAssetId, fun: xcmV1MultiassetFungibility }, destIdMultilocation)
    .signAndSend(currentAccount.address, { signer: injector.signer }, result => {
      console.log(`Current status is ${result.status.toString()}`);

      if (result.status.isInBlock) {
        console.log(`Transaction included at blockHash ${result.status.asInBlock.toString()}`);
      } else if (result.status.isFinalized) {
        console.log(`Transaction finalized at blockHash ${result.status.asFinalized.toString()}`);
        unsub();
      }
    });
};
