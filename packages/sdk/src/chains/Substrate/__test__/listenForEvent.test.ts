import type { ApiPromise } from '@polkadot/api';
import type { AnyJson } from '@polkadot/types-codec/types';

import { listenForEvent } from '../utils/index.js';

type MockCB = (v: { event: { data: string | object; method: string; section: string } }[]) => void;
describe('listenForEvent', () => {
  let api: ApiPromise;
  let eventName: string;
  let callback: jest.Mock;

  beforeEach(() => {
    api = { query: { system: { events: jest.fn() } } } as unknown as ApiPromise;
    eventName = 'testEvent';
    callback = jest.fn();
  });

  it('should call the callback when the correct event is received', async () => {
    const data = { testData: 'testData', toHuman: () => ({ testData: 'testData' }) as AnyJson };

    (api.query.system.events as unknown as jest.Mock).mockImplementationOnce((cb: MockCB) =>
      cb([{ event: { data, method: eventName, section: 'sygmaBridge' } }]),
    );

    await listenForEvent(api, eventName, callback);

    expect(callback).toHaveBeenCalledWith({ testData: 'testData' });
  });

  it('should not call the callback when an incorrect event is received', async () => {
    (api.query.system.events as unknown as jest.Mock).mockImplementationOnce((cb: MockCB) =>
      cb([{ event: { data: 'incorrectData', method: 'incorrectEvent', section: 'sygmaBridge' } }]),
    );

    await listenForEvent(api, eventName, callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should return a function to unsubscribe from the events', async () => {
    (api.query.system.events as unknown as jest.Mock).mockResolvedValue(() => {});
    const unsubscribeFn = await listenForEvent(api, eventName, callback);

    expect(typeof unsubscribeFn).toBe('function');
  });
});
