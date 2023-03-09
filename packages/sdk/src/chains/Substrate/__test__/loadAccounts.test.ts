import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types/create';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { keyring as Keyring } from '@polkadot/ui-keyring';
import { SubstrateConfigType } from '../types';

import * as Utils from '../utils';
import { retrieveChainInfo } from '../utils';
import { LoadAccountsCallbacksType } from '../utils/loadAccounts';

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
      systemChainType: registry.createType('ChainType', 'Development'),
    }),
  };
});

const mockApiPromise = {
  on: (arg: any, fn: () => void) => fn(),
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
describe('loadAccounts', () => {
  let config: SubstrateConfigType;
  let api: ApiPromise;
  let callbacks: LoadAccountsCallbacksType;
  let keyringMockLoadAll: jest.SpyInstance<
    ReturnType<Required<typeof Keyring>['loadAll']>,
    jest.ArgsType<Required<typeof Keyring>['loadAll']>
  >;

  beforeEach(() => {
    config = {
      domainId: '4',
      appName: 'test',
      provider_socket: '',
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

    keyringMockLoadAll = jest.spyOn(Keyring, 'loadAll').mockImplementation();
    callbacks = {
      onLoadKeyring: jest.fn(),
      onSetKeyring: jest.fn(),
      onErrorKeyring: jest.fn(),
    };
  });

  it('should call web3Enable with the correct parameter', async () => {
    await Utils.loadAccounts(config, api, callbacks);

    expect(web3Enable).toHaveBeenCalledWith('test');
  });

  it('should call web3Accounts and map the accounts correctly', async () => {
    await Utils.loadAccounts(config, api, callbacks);

    expect(web3Accounts).toHaveBeenCalled();

    expect(keyringMockLoadAll).toHaveBeenCalledWith({ isDevelopment: true }, [
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

    expect(keyringMockLoadAll).toHaveBeenCalled();

    expect(retrieveChainInfo).toHaveBeenCalledWith(api);
  });

  it('should call callbacks onLoadKeyring and onSetKeyring with the correct parameters on success', async () => {
    await Utils.loadAccounts(config, api, callbacks);

    expect(keyringMockLoadAll).toHaveBeenCalled();

    expect(callbacks.onLoadKeyring).toHaveBeenCalled();

    expect(callbacks.onSetKeyring).toHaveBeenCalledWith(Keyring);
  });

  it('should call callabacks onLoadKeyring and onErrorKeyring with the correct parameters when failed', async () => {
    jest.spyOn(Keyring, 'loadAll').mockImplementation(() => {
      throw new Error('No');
    });
    await Utils.loadAccounts(config, api, callbacks);

    expect(keyringMockLoadAll).toHaveBeenCalled();

    expect(callbacks.onLoadKeyring).toHaveBeenCalled();

    expect(callbacks.onErrorKeyring).toHaveBeenCalledWith(new Error('No'));
  });

  it('should call callabacks onLoadKeyring if web3Enable returns []', async () => {
    (web3Enable as jest.Mock<any, any, any>).mockResolvedValue([]);
    await Utils.loadAccounts(config, api, callbacks);

    expect(keyringMockLoadAll).toHaveBeenCalled();

    expect(callbacks.onLoadKeyring).toHaveBeenCalled();

    expect(callbacks.onErrorKeyring).toHaveBeenCalledWith(
      new Error("Can't get any injected sources. Is the wallet authorized?"),
    );
  });
});
