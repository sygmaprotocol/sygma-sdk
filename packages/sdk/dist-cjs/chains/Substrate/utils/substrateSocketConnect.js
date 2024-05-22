"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.substrateSocketConnect = void 0;
const api_1 = require("@polkadot/api");
/**
 * Connects to a Substrate node using WebSockets API by creating a new WsProvider instance with the given socket address.
 *
 * @category Helpers
 * @param {Object} state - An object that contains the state of the API, including the connection status, socket address, and JSON-RPC interface.
 * @param {SubstrateSocketConnectionCallbacksType} callbacks - Optional callbacks
 * @returns {ApiPromise} - An instance of the ApiPromise class.
 */
const substrateSocketConnect = (state, callbacks) => {
    const { apiState, socket, jsonrpc } = state;
    // We only want this function to be performed once
    if (apiState)
        return;
    callbacks?.onConnectInit?.();
    // console.log(`Connected socket: ${socket}`);
    const provider = new api_1.WsProvider(socket);
    const _api = new api_1.ApiPromise({ provider, rpc: jsonrpc });
    // Set listeners for disconnection and reconnection event.
    _api.on('connected', () => {
        callbacks?.onConnect?.(_api);
        // `ready` event is not emitted upon reconnection and is checked explicitly here.
        void _api.isReady.then(() => callbacks?.onConnectSucccess?.(_api));
    });
    _api.on('ready', () => callbacks?.onConnectSucccess?.(_api));
    _api.on('error', (err) => callbacks?.onConnectError?.(err));
    return _api;
};
exports.substrateSocketConnect = substrateSocketConnect;
//# sourceMappingURL=substrateSocketConnect.js.map