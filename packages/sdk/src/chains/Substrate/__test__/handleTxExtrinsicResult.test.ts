import { ApiPromise, SubmittableResult } from '@polkadot/api';
import {DepositCallbacksType} from '../utils/depositFns'

import * as Utils from '../utils/depositFns';

describe('handleTxExtrinsicResult', () => {
  let api: ApiPromise
  let callbacksMockFns: DepositCallbacksType;
  let unsub: () => void
  beforeEach(() => {
    api = {} as ApiPromise
    unsub = jest.fn()
    callbacksMockFns = {
      onInBlock: jest.fn(),
      onFinalized: jest.fn(),
      onError: jest.fn()
    }
  });

  it('should call onInBlock when status isInBlock', () => {
    // @ts-ignore-line
    const result: SubmittableResult  = { status: { isInBlock: true, asInBlock: '12345' } };

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(callbacksMockFns.onInBlock).toHaveBeenCalledWith(result.status);
  });

  it('should call onFinalized when status isFinalized', () => {
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isFinalized: true, asFinalized: '12345' } };

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(callbacksMockFns.onFinalized).toHaveBeenCalledWith(result.status);
  });

  it('should call unsub when status isFinalized', () => {
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isFinalized: true, asFinalized: '12345' } };

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(unsub).toHaveBeenCalledTimes(1);
  });

});

