import { ApiPromise, SubmittableResult } from '@polkadot/api';

import * as Utils from '../utils';

describe('handleTxExtrinsicResult', () => {
  it('should dispatch the correct type and payload when status isInBlock', () => {
    const api = {} as ApiPromise;
    // @ts-ignore-line
    const result: SubmittableResult  = { status: { isInBlock: true, asInBlock: '12345' } };
    const dispatch = jest.fn();
    const unsub = jest.fn();

    Utils.handleTxExtrinsicResult(api, result, dispatch, unsub);

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRANSFER_STATUS', payload: 'In block' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRANSFER_STATUS_BLOCK', payload: '12345' });
  });

  it('should dispatch the correct type and payload when status isFinalized', () => {
    const api = {} as ApiPromise;
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isFinalized: true, asFinalized: '12345' } };
    const dispatch = jest.fn();
    const unsub = jest.fn();

    Utils.handleTxExtrinsicResult(api, result, dispatch, unsub);

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRANSFER_STATUS', payload: 'Finalized' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRANSFER_STATUS_BLOCK', payload: '12345' });
  });

  it('should call unsub when status isFinalized', () => {
    const api = {} as ApiPromise;
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isFinalized: true, asFinalized: '12345' } };
    const dispatch = jest.fn();
    const unsub = jest.fn();

    Utils.handleTxExtrinsicResult(api, result, dispatch, unsub);

    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('should throw error if any in events log', () => {
    const api = {} as ApiPromise;
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isFinalized: true, asFinalized: '12345' } };
    const dispatch = jest.fn();
    const unsub = jest.fn();
    // mock throwErrorIfAny to throw an error
    // so that we can test if the function throws an error or not
    jest.spyOn(Utils, "throwErrorIfAny").mockImplementation();

    Utils.handleTxExtrinsicResult(api, result, dispatch, unsub);

    expect(Utils.throwErrorIfAny).toHaveBeenCalledWith(api, result, unsub)
  });

});

