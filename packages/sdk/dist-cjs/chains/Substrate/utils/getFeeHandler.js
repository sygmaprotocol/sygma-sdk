"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeeHandler = void 0;
const index_js_1 = require("../../../types/index.js");
/**
 * Retrieves the fee handler for a given domainId and asset.
 *
 * @category Fee
 * @param {ApiPromise} api - The Substrate API instance.
 * @param {number} destinationDomainId - The ID of the domain.
 * @param {XcmMultiAssetIdType} xcmMultiAssetId - The XCM MultiAsset ID of the asset. {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset | More details}
 * @returns {Promise} A promise that resolves to a FeeHandlerType object.
 * @throws {Error} Unable to retrieve fee from pallet
 */
const getFeeHandler = async (api, destinationDomainId, xcmMultiAssetId) => {
    const feeHandler = await api.query.sygmaFeeHandlerRouter.handlerType([
        destinationDomainId,
        xcmMultiAssetId,
    ]);
    if (feeHandler.isNone) {
        return index_js_1.FeeHandlerType.UNDEFINED;
    }
    const feeHandlerName = feeHandler.unwrap().toString();
    switch (feeHandlerName) {
        case 'PercentageFeeHandler':
            return index_js_1.FeeHandlerType.PERCENTAGE;
        case 'BasicFeeHandler':
            return index_js_1.FeeHandlerType.BASIC;
        case 'DynamicFeeHandler':
            return index_js_1.FeeHandlerType.DYNAMIC;
        default:
            throw new Error('Invalid Fee Handler Type');
    }
};
exports.getFeeHandler = getFeeHandler;
//# sourceMappingURL=getFeeHandler.js.map