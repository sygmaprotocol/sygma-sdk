import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { DepositCallbacksType } from '../utils/depositFns.js';

import * as Utils from '../utils/depositFns.js';

describe('handleTxExtrinsicResult', () => {
  let api: ApiPromise;
  let callbacksMockFns: DepositCallbacksType;
  let unsub: () => void;
  beforeEach(() => {
    api = {} as ApiPromise;
    unsub = jest.fn();
    callbacksMockFns = {
      onInBlock: jest.fn(),
      onFinalized: jest.fn(),
      onError: jest.fn(),
      onDepositEvent: jest.fn(),
    };
  });

  it('should call onInBlock when status isInBlock', () => {
    const result: SubmittableResult = {
      status: { isInBlock: true, asInBlock: '12345' },
    } as unknown as SubmittableResult;

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(callbacksMockFns.onInBlock).toHaveBeenCalledWith(result.status);
  });

  it('should call onFinalized when status isFinalized', () => {
    const result: SubmittableResult = {
      status: { isFinalized: true, asFinalized: '12345' },
      events: [],
    } as unknown as SubmittableResult;

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(callbacksMockFns.onFinalized).toHaveBeenCalledWith(result.status);
  });

  it('should call unsub when status isFinalized', () => {
    const result: SubmittableResult = {
      status: { isFinalized: true, asFinalized: '12345' },
      events: [],
    } as unknown as SubmittableResult;

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('should call onDepositEvent with correct args when events have corresponding event', () => {
    api = {
      events: {
        system: {
          ExtrinsicFailed: {
            is: jest.fn().mockReturnValue(false),
          },
        },
      },
    } as unknown as ApiPromise;

    const result: SubmittableResult = {
      status: { isFinalized: true, asFinalized: '12345' },
      events: [
        {
          event: {
            data: {
              toHuman: () => ({
                depositData: '0x00',
                depositNonce: '9',
                destDomainId: '10',
                handlerResponse: '0x01',
                resourceId: '0x000',
                sender: 'abc',
                transferType: 'Fun',
              }),
            },
            method: 'Deposit',
            section: 'sygmaBridge',
          },
        },
      ],
    } as unknown as SubmittableResult;
    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);
    expect(callbacksMockFns.onDepositEvent).toHaveBeenCalledWith({
      depositData: '0x00',
      depositNonce: '9',
      destDomainId: '10',
      handlerResponse: '0x01',
      resourceId: '0x000',
      sender: 'abc',
      transferType: 'Fun',
    });
  });
});
