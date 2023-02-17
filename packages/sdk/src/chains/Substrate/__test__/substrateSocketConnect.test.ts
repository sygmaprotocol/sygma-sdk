import { TypeRegistry } from '@polkadot/types/create';

import { substrateSocketConnect } from '../utils';
import { SubstrateSocketConnectionCallbacksType } from '../utils/substrateSocketConnect';

const registry = new TypeRegistry();

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

describe('substrateSocketConnect', () => {
  let state: { apiState: any; socket: any; jsonrpc: any };
  // let dispatch: jest.Mock<any, any>;
  let callbacks: SubstrateSocketConnectionCallbacksType;
  beforeEach(() => {
    state = {
      apiState: '',
      socket: 'ws://localhost:9944',
      jsonrpc: {},
    };

    callbacks = {
      onConnectInit: jest.fn(),
      onConnect: jest.fn(),
      onConnectSucccess: jest.fn(),
      onConnectError: jest.fn(),
    };
  });

  it('should return if apiState is set', () => {
    state.apiState = 'connected';

    substrateSocketConnect(state, callbacks);

    expect(callbacks.onConnectInit).not.toHaveBeenCalled();
  });

  it('should call onConnectInit', () => {
    substrateSocketConnect(state, callbacks);

    expect(callbacks.onConnectInit).toHaveBeenCalled();
  });

  it('should call onConnect with API as payload when connected event is emitted', () => {
    substrateSocketConnect(state, callbacks);

    expect(callbacks.onConnect).toHaveBeenCalledWith(mockApiPromise);
  });

  it('should call onConnectSucccess when ready event is emitted', () => {
    substrateSocketConnect(state, callbacks);

    expect(callbacks.onConnectSucccess).toHaveBeenCalledWith(mockApiPromise);
  });

  it('should call onConnectError with error as argument when error event is emitted', async () => {
    const connect = substrateSocketConnect(state, callbacks);
    await connect?.isReadyOrError;
    expect(callbacks.onConnectError).toHaveBeenCalled();
  });
});
