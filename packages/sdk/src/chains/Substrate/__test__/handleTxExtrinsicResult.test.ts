import { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { Event } from '@polkadot/types/interfaces';

import { DepositCallbacksType } from '../utils/depositFns';

import * as Utils from '../utils/depositFns';

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
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isInBlock: true, asInBlock: '12345' } };

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(callbacksMockFns.onInBlock).toHaveBeenCalledWith(result.status);
  });

  it('should call onFinalized when status isFinalized', () => {
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isFinalized: true, asFinalized: '12345' }, events: [] };

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(callbacksMockFns.onFinalized).toHaveBeenCalledWith(result.status);
  });

  it('should call unsub when status isFinalized', () => {
    // @ts-ignore-line
    const result: SubmittableResult = { status: { isFinalized: true, asFinalized: '12345' }, events: [] };

    Utils.handleTxExtrinsicResult(api, result, unsub, callbacksMockFns);

    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('should call onDepositEvent with correct args when events have corresponding event', () => {
    api = {
      events: {
        system: {
          ExtrinsicFailed: {
            // @ts-ignore-line
            is: jest.fn().mockReturnValue(false)
          }
        }
      }
    }

    const result: SubmittableResult = {
      // @ts-ignore-line
      status: { isFinalized: true, asFinalized: '12345' },
      events: [
        {
          event: {
            // @ts-ignore-line
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
    };
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
