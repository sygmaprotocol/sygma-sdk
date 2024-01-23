import type { ApiPromise, SubmittableResult } from '@polkadot/api';

import { throwErrorIfAny } from '../utils/index.js';

describe('throwErrorIfAny', () => {
  let api: ApiPromise;
  let result: SubmittableResult;
  let unsub: () => void;
  let findMetaErrorMock: jest.Mock;

  beforeEach(() => {
    findMetaErrorMock = jest.fn().mockReturnValue({
      docs: ['can', 'not', 'do'],
      method: 'skrew',
      section: 'bridge',
    });
    api = {
      events: {
        system: {
          ExtrinsicFailed: {
            is: jest.fn().mockReturnValue(true),
          },
        },
      },
      registry: {
        findMetaError: findMetaErrorMock,
      },
    } as unknown as ApiPromise;
    result = {
      events: [
        {
          data: [{ isModule: true }],
        },
      ],
      status: {},
    } as unknown as SubmittableResult;
    unsub = jest.fn();
  });

  it('should throw an error when status is in block or finalized', () => {
    (result.status.isInBlock as unknown) = true;

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow();
    (result.status.isFinalized as unknown) = true;

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow();
  });

  it('should not throw an error when status is not in block or finalized', () => {
    expect(() => throwErrorIfAny(api, result, unsub)).not.toThrow();
  });

  it('should call the unsubscribe function when an module error is thrown', () => {
    (result.status.isInBlock as unknown) = true;
    const eventData = [{ asModule: 'test', isModule: true }]; // mock data for DispatchError event type

    // mock system ExtrinsicFailed event type and data for the event object in the events array of the SubmittableResult object passed to the function
    (result.events[0] as unknown) = { event: { type: 'system.ExtrinsicFailed', data: eventData } };

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow('bridge.skrew: can not do'); // call the function and check that it throws an error
    expect(findMetaErrorMock).toBeCalledWith('test');

    expect(unsub).toHaveBeenCalledTimes(1); // check that the unsubscribe function has been called
  });

  it('should call the unsubscribe function when an other error is thrown', () => {
    (result.status.isInBlock as unknown) = true;
    const eventData = [{ isModule: false, toString: () => 'OTHER' }]; // mock data for DispatchError event type

    // mock system ExtrinsicFailed event type and data for the event object in the events array of the SubmittableResult object passed to the function
    (result.events[0] as unknown) = { event: { type: 'system.ExtrinsicFailed', data: eventData } };

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow('OTHER'); // call the function and check that it throws an error
    expect(findMetaErrorMock).not.toHaveBeenCalled();

    expect(unsub).toHaveBeenCalledTimes(1); // check that the unsubscribe function has been called
  });
});
