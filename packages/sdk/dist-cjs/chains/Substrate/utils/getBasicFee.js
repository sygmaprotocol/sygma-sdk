"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBasicFee = void 0;
const util_1 = require("@polkadot/util");
const index_js_1 = require("../../../types/index.js");
/**
 * Retrieves the basic fee for a given domainId and asset.
 *
 * @example
 * // Assuming the api instance is already connected and ready to use
 * const domainId = 1;
 * const xcmMultiAssetId = {...} // XCM MultiAsset ID of the asset
 * getBasicFee(api, domainId, xcmMultiAssetId)
 *   .catch((error) => {
 *     console.error('Error fetching basic fee:', error);
 *   });
 *
 * @category Fee
 * @param {ApiPromise} api - The Substrate API instance.
 * @param {number} domainId - The ID of the domain.
 * @param {XcmMultiAssetIdType} xcmMultiAssetId - The XCM MultiAsset ID of the asset. {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset | More details}
 * @returns {Promise<SubstrateFee>} A promise that resolves to a SubstrateFee object.
 * @throws {Error} Unable to retrieve fee from pallet
 */
const getBasicFee = async (api, destinationDomainId, xcmMultiAssetId) => {
    const rawFee = await api.query.sygmaBasicFeeHandler.assetFees([
        destinationDomainId,
        xcmMultiAssetId,
    ]);
    if (rawFee.isNone) {
        throw new Error('Error retrieving fee');
    }
    return {
        fee: new util_1.BN(rawFee.unwrap()),
        type: index_js_1.FeeHandlerType.BASIC,
    };
};
exports.getBasicFee = getBasicFee;
//# sourceMappingURL=getBasicFee.js.map