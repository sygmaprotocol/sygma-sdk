
import { ApiPromise, SubmittableResult } from '@polkadot/api';

import {throwErrorIfAny} from '../utils';

describe('throwErrorIfAny', () => {
  let api: ApiPromise;
  let result: SubmittableResult;
  let unsub: () => void;

  beforeEach(() => {
    api = {
      events: {
        system: {
          ExtrinsicFailed: {
            // @ts-ignore-line
            is: jest.fn().mockReturnValue(true)
          }
        }
      },
      // @ts-ignore-line
      registry: {
        findMetaError: jest.fn().mockReturnValue({
          docs: ['can', 'not', 'do'],
          method: 'skrew',
          section: 'bridge'
        })
      }
    };
    result = { events: [{
      // @ts-ignore-line
      data: [
        {isModule: true}
      ]
    // @ts-ignore-line
    }], status: {} };
    unsub = jest.fn();
  });

  it('should throw an error when status is in block or finalized', () => {
    // @ts-ignore-line
    result.status.isInBlock = true;

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow();
    // @ts-ignore-line
    result.status.isFinalized = true;

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow();
  });

  it('should not throw an error when status is not in block or finalized', () => {
    expect(() => throwErrorIfAny(api, result, unsub)).not.toThrow();
  });

  it('should call the unsubscribe function when an module error is thrown', () => {
    // @ts-ignore-line
    result.status.isInBlock = true;
    const eventData = [{ asModule: 'test', isModule: true }]; // mock data for DispatchError event type

    // mock system ExtrinsicFailed event type and data for the event object in the events array of the SubmittableResult object passed to the function
    // @ts-ignore-line
    result.events[0] = { event: { type: 'system.ExtrinsicFailed', data: eventData } };

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow('bridge.skrew: can not do'); // call the function and check that it throws an error
    expect(api.registry.findMetaError).toBeCalledWith('test')

    expect(unsub).toHaveBeenCalledTimes(1); // check that the unsubscribe function has been called
  });

  it('should call the unsubscribe function when an other error is thrown', () => {
    // @ts-ignore-line
    result.status.isInBlock = true;
    const eventData = [{ isModule: false, toString: () => "OTHER" }]; // mock data for DispatchError event type

    // mock system ExtrinsicFailed event type and data for the event object in the events array of the SubmittableResult object passed to the function
    // @ts-ignore-line
    result.events[0] = { event: { type: 'system.ExtrinsicFailed', data: eventData } };

    expect(() => throwErrorIfAny(api, result, unsub)).toThrow("OTHER"); // call the function and check that it throws an error
    expect(api.registry.findMetaError).not.toHaveBeenCalled()

    expect(unsub).toHaveBeenCalledTimes(1); // check that the unsubscribe function has been called
  });
});