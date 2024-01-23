import type { DefinitionRpcExt } from '@polkadot/types/types';
import { ApiPromise, WsProvider } from '@polkadot/api';

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
export const substrateSocketConnect = (
  state: {
    apiState: string | null | undefined;
    socket: string;
    jsonrpc: {
      [x: string]: Record<string, DefinitionRpcExt>;
    };
  },
  callbacks?: SubstrateSocketConnectionCallbacksType,
): ApiPromise | undefined => {
  const { apiState, socket, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState) return;

  callbacks?.onConnectInit?.();

  // console.log(`Connected socket: ${socket}`);
  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    callbacks?.onConnect?.(_api);
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    void _api.isReady.then(() => callbacks?.onConnectSucccess?.(_api));
  });
  _api.on('ready', () => callbacks?.onConnectSucccess?.(_api));

  _api.on('error', (err: Event) => callbacks?.onConnectError?.(err));

  return _api;
};
