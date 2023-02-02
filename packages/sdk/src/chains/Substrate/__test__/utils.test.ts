/* eslint-disable */

import { substrateSocketConnect } from '../utils';

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
  describe('substrateSocketConnect', () => {
    let state: { apiState: any; socket: any; jsonrpc: any };
    let dispatch: jest.Mock<any, any>;

    beforeEach(() => {
      state = {
        apiState: '',
        socket: 'ws://localhost:9944',
        jsonrpc: {},
      };

      dispatch = jest.fn();
    });

    it('should return if apiState is set', () => {
      state.apiState = 'connected';

      substrateSocketConnect(state, dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should call dispatch with CONNECT_INIT type', () => {
      substrateSocketConnect(state, dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: 'CONNECT_INIT', payload: undefined });
    });

    it('should call dispatch with CONNECT type and API as payload when connected event is emitted', () => {
      substrateSocketConnect(state, dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: 'CONNECT', payload: mockApiPromise });
    });

    it('should call dispatch with CONNECT_SUCCESS type when ready event is emitted', () => {
      substrateSocketConnect(state, dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: 'CONNECT_SUCCESS', payload: undefined });
    });

    it('should call dispatch with CONNECT_ERROR type and error as payload when error event is emitted', async () => {
      const conect = substrateSocketConnect(state, dispatch);
      await conect?.isReadyOrError
      expect(dispatch).toHaveBeenLastCalledWith({ type: 'CONNECT_ERROR'});
    });
  });
});
