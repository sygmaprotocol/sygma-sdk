import { DefinitionRpcExt } from '@polkadot/types/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { keyring as Keyring } from '@polkadot/ui-keyring';
import { isTestChain } from '@polkadot/util';
import { TypeRegistry } from '@polkadot/types/create';
import { ChainType } from '@polkadot/types/interfaces';

import { SubstrateConfigType } from '../../types';

const registry = new TypeRegistry();

///
// Connecting to the Substrate node
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
): void => {
  const { apiState, socket, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState) return;

  dispatch({ type: 'CONNECT_INIT', payload: undefined });

  console.log(`Connected socket: ${socket}`);
  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    void _api.isReady.then(_api => dispatch({ type: 'CONNECT_SUCCESS', payload: undefined }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS', payload: undefined }));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }));
};

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
// Loading accounts from dev and polkadot-js extension
export const loadAccounts = (
  config: SubstrateConfigType,
  state: { api: ApiPromise },
  dispatch: React.Dispatch<{
    type: string;
    payload: any;
  }>,
): void => {
  const { api } = state;
  dispatch({ type: 'LOAD_KEYRING', payload: undefined });

  const asyncLoadAccounts = async (): Promise<void> => {
    try {
      await web3Enable(config.APP_NAME);
      let allAccounts = await web3Accounts();

      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name ?? 'no name'} (${meta.source})` },
      }));

      // Logics to check if the connecting chain is a dev chain, coming from polkadot-js Apps
      // ref: https://github.com/polkadot-js/apps/blob/15b8004b2791eced0dde425d5dc7231a5f86c682/packages/react-api/src/Api.tsx?_pjax=div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20%3E%20main#L101-L110
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
  void asyncLoadAccounts();
};
