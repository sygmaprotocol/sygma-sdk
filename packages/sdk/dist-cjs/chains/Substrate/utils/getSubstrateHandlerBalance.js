"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubstrateHandlerBalance = void 0;
const api_1 = require("@polkadot/api");
const rpc_provider_1 = require("@polkadot/rpc-provider");
const getNativeTokenBalance_js_1 = require("./getNativeTokenBalance.js");
const getAssetBalance_js_1 = require("./getAssetBalance.js");
const getSubstrateHandlerBalance = async (destinationProviderUrl, resource, handlerAddress) => {
    const wsProvider = new rpc_provider_1.WsProvider(destinationProviderUrl);
    const apiPromise = new api_1.ApiPromise({ provider: wsProvider });
    if (resource.native) {
        const accountInfo = await (0, getNativeTokenBalance_js_1.getNativeTokenBalance)(apiPromise, handlerAddress);
        return BigInt(accountInfo.free.toString());
    }
    else {
        const assetBalance = await (0, getAssetBalance_js_1.getAssetBalance)(apiPromise, resource.assetID ?? 0, handlerAddress);
        return BigInt(assetBalance.balance.toString());
    }
};
exports.getSubstrateHandlerBalance = getSubstrateHandlerBalance;
//# sourceMappingURL=getSubstrateHandlerBalance.js.map