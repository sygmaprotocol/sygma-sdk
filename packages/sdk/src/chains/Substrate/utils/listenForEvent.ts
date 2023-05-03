import { ApiPromise } from '@polkadot/api';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { AnyJson } from '@polkadot/types-codec/types';

/**
 * Listens for an event and calls a callback when it is triggered.
 *
 * @example
 * // Assuming you have a valid ApiPromise instance (api)
 * // and a callback function (callback)
 * await listenForEvent(api, "ProposalExecution", (data) => {
 *   console.log("ProposalExecution", data);
 *   const dataEvent = data as {
 *     depositNonce: string;
 *     dataHash: string;
 *    };
 *    console.log("ProposalExecution event is emmited. Transfer is finished")
 *    console.log(dataEvent)
 * });
 *
 * @category Event handling
 * @param {ApiPromise} api - An ApiPromise instance.
 * @param {string} eventName - The name of the event to listen for.
 * @param {(data: AnyJson) => void} callback - The function to call when the event is triggered.
 * @returns {Promise<(() => void) | undefined>}  A promise that resolves when the event is triggered.
 */
export const listenForEvent = async (
  api: ApiPromise,
  eventName: string,
  callback: (data: AnyJson) => void,
): Promise<(() => void) | undefined> => {
  let unsub: () => void;
  try {
    unsub = (await api.query.system.events((events: EventRecord[]) => {
      // loop through the Vec<EventRecord>
      events.forEach(({ event: { data, method, section } }) => {
        if (section === 'sygmaBridge' && method === eventName) {
          callback(data.toHuman());
          unsub();
        }
      });
    })) as unknown as () => void;
    return unsub;
  } catch (e) {
    console.error('listenForEvent Error:', e);
  }
};
