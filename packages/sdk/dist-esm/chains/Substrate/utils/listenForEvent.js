/**
 * Listens for an event and calls a callback when it is triggered.
 *
 * @example
 * import { ApiPromise, WsProvider } from '@polkadot/api';
 * import { listenForEvent } from '@buildwithsygma/sygma-sdk/Substrate';
 * // Create a new instance of the WsProvider to connect to a node
 * const socket = 'wss://localhost:9944';
 * const provider = new WsProvider(socket);
 * // Create a new instance of the ApiPromise
 * const api = await ApiPromise.create({ provider });
 * //Assuming you have a and a callback function
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
 * @param {string} eventName - The name of the event to listen for. The event that is signalled when the transaction is executed is called "ProposalExecution".
 * @param {(data: AnyJson) => void} callback - The function to call when the event is triggered.
 * @returns {Promise<(() => void) | undefined>}  A promise that resolves when the event is triggered.
 */
export const listenForEvent = async (api, eventName, callback) => {
    return (await api.query.system.events((events) => {
        // loop through the Vec<EventRecord>
        events.forEach(({ event: { data, method, section } }) => {
            if (section === 'sygmaBridge' && method === eventName) {
                callback(data.toHuman());
            }
        });
    }));
};
//# sourceMappingURL=listenForEvent.js.map