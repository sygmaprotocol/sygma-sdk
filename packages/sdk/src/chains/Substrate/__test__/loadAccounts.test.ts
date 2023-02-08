import { ApiPromise, WsProvider } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types/create';
import { SubstrateConfigType } from '../../../types';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { keyring as Keyring } from '@polkadot/ui-keyring';

import * as Utils from '../utils';


const registry = new TypeRegistry();

jest.mock('@polkadot/extension-dapp',  () => ({
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
  ])
}))


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
    let state: { api: ApiPromise };
    let dispatch: jest.Mock;

    beforeEach(() => {
      config = { appName: 'test', provider_socket: '', CUSTOM_RPC_METHODS: '', assets: [
        {
          assetName: 'USDT',
          assetId: 1000,
          xsmMultiAssetId: {
            concrete: {
              parents: 1,
              interior: {
                x3: [
                  { parachain: 2005 },
                  { generalKey: "0x7777" },
                  { generalKey: "0x88" },
                ],
              },
            },
          }
        }
      ] };
      state = { api: new ApiPromise() };
      jest
        .spyOn(Utils, 'retrieveChainInfo')
        .mockResolvedValue({
          systemChain: 'Development',
          // @ts-ignore-line
          systemChainType: registry.createType('ChainType', 'Development'),
        });
        jest.spyOn(Keyring, 'loadAll').mockImplementation()
      dispatch = jest.fn();
    });

    it('should call web3Enable with the correct parameter', async () => {
      await Utils.loadAccounts(config, state, dispatch);

      expect(web3Enable).toHaveBeenCalledWith('test');
    });

    it('should call web3Accounts and map the accounts correctly', async () => {
      await Utils.loadAccounts(config, state, dispatch);

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
      await Utils.loadAccounts(config, state, dispatch);

      expect(Keyring.loadAll).toHaveBeenCalled();

      expect(Utils.retrieveChainInfo).toHaveBeenCalledWith(state.api);

    });

    it('should call dispatch with the correct parameters on success', async () => {
        await Utils.loadAccounts(config, state, dispatch);

        expect(Keyring.loadAll).toHaveBeenCalled();

        expect(dispatch).toHaveBeenNthCalledWith (1 ,{ type:'LOAD_KEYRING', payload : undefined});

        expect(dispatch).toHaveBeenNthCalledWith (2 ,{ type:'SET_KEYRING' , payload : Keyring});
    });

  });
});
