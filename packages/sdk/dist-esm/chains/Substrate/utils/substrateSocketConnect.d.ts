import type { DefinitionRpcExt } from '@polkadot/types/types';
import { ApiPromise } from '@polkadot/api';
export type SubstrateSocketConnectionCallbacksType = {
    /**
     * Callback called before whole connection logic started
     */
    onConnectInit?: () => void;
    /**
     * Callback for when the connection is established.
     */
    onConnect?: (api: ApiPromise) => void;
    /**
     * Callback for when the connection is successful.
     */
    onConnectSucccess?: (api: ApiPromise) => void;
    /**
     * Callback for when an error occurs with the connection.
     */
    onConnectError?: (error: Event) => void;
};
/**
 * Connects to a Substrate node using WebSockets API by creating a new WsProvider instance with the given socket address.
 *
 * @category Helpers
 * @param {Object} state - An object that contains the state of the API, including the connection status, socket address, and JSON-RPC interface.
 * @param {SubstrateSocketConnectionCallbacksType} callbacks - Optional callbacks
 * @returns {ApiPromise} - An instance of the ApiPromise class.
 */
export declare const substrateSocketConnect: (state: {
    apiState: string | null | undefined;
    socket: string;
    jsonrpc: {
        [x: string]: Record<string, DefinitionRpcExt>;
    };
}, callbacks?: SubstrateSocketConnectionCallbacksType) => ApiPromise | undefined;
//# sourceMappingURL=substrateSocketConnect.d.ts.map