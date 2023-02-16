import { ApiPromise, WsProvider } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types/create';
import { SubstrateConfigType } from '../../../types';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { keyring as Keyring } from '@polkadot/ui-keyring';

import * as Utils from '../utils';
import {retrieveChainInfo} from  '../utils/retrieveChainInfo';
import {LoadAccountsCallbacksType} from '../utils/loadAccounts';

jest.mock('@polkadot/extension-dapp', () => ({
  web3Enable: jest.fn().mockResolvedValue(true),
  web3Accounts: jest.fn().mockResolvedValue([
    {
      address: '5DhjtK8fwZVc1Q2w4LUKxAAUyH7nzhzXUv89B1a6FdYynWvN',
      meta: { genesisHash: '', name: 'Caterpillar', source: 'polkadot-js' },
      type: 'sr25519',
    },
    {
      address: '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt',
      meta: { genesisHash: '', name: 'SygmaTest', source: 'polkadot-js' },
      type: 'sr25519',
    },
  ]),
}));
jest.mock('../utils/retrieveChainInfo', () => {
  const registry = new TypeRegistry();

  return {
    retrieveChainInfo: jest.fn().mockResolvedValue({
      systemChain: 'Development',
      // @ts-ignore-line
      systemChainType: registry.createType('ChainType', 'Development'),
    }),
  };
});

const mockApiPromise = {
  on: (arg: any, fn: () => any) => fn(),
  isReady: new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, 1);
  }),
};
jest.mock('@polkadot/api', () => ({
  WsProvider: jest.fn(),
  ApiPromise: jest.fn().mockImplementation(() => mockApiPromise),
}));
describe('utils', () => {
  describe('loadAccounts', () => {
    let config: SubstrateConfigType;
    let api: ApiPromise;
    let callbacks: LoadAccountsCallbacksType;

    beforeEach(() => {
      config = {
        appName: 'test',
        provider_socket: '',
        CUSTOM_RPC_METHODS: '',
        assets: [
          {
            assetName: 'USDT',
            assetId: 1000,
            xsmMultiAssetId: {
              concrete: {
                parents: 1,
                interior: {
                  x3: [{ parachain: 2005 }, { generalKey: '0x7777' }, { generalKey: '0x88' }],
                },
              },
            },
          },
        ],
      };
      api = new ApiPromise();

      jest.spyOn(Keyring, 'loadAll').mockImplementation();
      callbacks = {
        onLoadKeyring: jest.fn(),
        onSetKeyring: jest.fn(),
        onErrorKeyring: jest.fn()
      }
    });

    it('should call web3Enable with the correct parameter', async () => {
      await Utils.loadAccounts(config, api, callbacks);

      expect(web3Enable).toHaveBeenCalledWith('test');
    });

    it('should call web3Accounts and map the accounts correctly', async () => {
      await Utils.loadAccounts(config, api, callbacks);

      expect(web3Accounts).toHaveBeenCalled();

      expect(Keyring.loadAll).toHaveBeenCalledWith({ isDevelopment: true }, [
        {
          address: '5DhjtK8fwZVc1Q2w4LUKxAAUyH7nzhzXUv89B1a6FdYynWvN',
          meta: { genesisHash: '', name: 'Caterpillar (polkadot-js)', source: 'polkadot-js' },
        },
        {
          address: '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt',
          meta: { genesisHash: '', name: 'SygmaTest (polkadot-js)', source: 'polkadot-js' },
        },
      ]);
    });

    it('should call retrieveChainInfo and isTestChain correctly', async () => {
      await Utils.loadAccounts(config, api, callbacks);

      expect(Keyring.loadAll).toHaveBeenCalled();

      expect(retrieveChainInfo).toHaveBeenCalledWith(api);
    });

    it('should call callbacks onLoadKeyring and onSetKeyring with the correct parameters on success', async () => {
      await Utils.loadAccounts(config, api, callbacks);

      expect(Keyring.loadAll).toHaveBeenCalled();

      expect(callbacks.onLoadKeyring).toHaveBeenCalled();

      expect(callbacks.onSetKeyring).toHaveBeenCalledWith( Keyring );
    });

    it('should call callabacks onLoadKeyring and onErrorKeyring with the correct parameters when failed', async () => {
      // jest.spyOn(Keyring, 'loadAll').mockClear();
      jest.spyOn(Keyring, 'loadAll').mockImplementation(() => {throw new Error('No')})
      await Utils.loadAccounts(config, api, callbacks);

      expect(Keyring.loadAll).toHaveBeenCalled();

      expect(callbacks.onLoadKeyring).toHaveBeenCalled();

      expect(callbacks.onErrorKeyring).toHaveBeenCalledWith(new Error("No"));
    });
  });
});
