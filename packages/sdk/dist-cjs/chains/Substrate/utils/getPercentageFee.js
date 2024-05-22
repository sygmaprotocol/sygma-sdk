"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPercentageFee = void 0;
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
const getPercentageFee = async (api, transfer) => {
    const assetId = transfer.resource.xcmMultiAssetId;
    const feeStructure = await api.query.sygmaPercentageFeeHandler.assetFeeRate([
        transfer.to.id,
        assetId,
    ]);
    if (feeStructure.isNone) {
        throw new Error('Error retrieving fee');
    }
    const [feeRate, min, max] = feeStructure
        .unwrap()
        .toArray()
        .map(val => new util_1.BN(val.toString()));
    const calculatedFee = new util_1.BN(transfer.details.amount).mul(feeRate).div(new util_1.BN(10000));
    let fee;
    if (calculatedFee.lt(min)) {
        fee = min;
    }
    else if (calculatedFee.gt(max)) {
        fee = max;
    }
    else {
        fee = calculatedFee;
    }
    return {
        fee: fee,
        type: index_js_1.FeeHandlerType.PERCENTAGE,
    };
};
exports.getPercentageFee = getPercentageFee;
//# sourceMappingURL=getPercentageFee.js.map