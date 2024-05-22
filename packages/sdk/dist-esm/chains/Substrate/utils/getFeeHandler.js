import { FeeHandlerType } from '../../../types/index.js';
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
export const getFeeHandler = async (api, destinationDomainId, xcmMultiAssetId) => {
    const feeHandler = await api.query.sygmaFeeHandlerRouter.handlerType([
        destinationDomainId,
        xcmMultiAssetId,
    ]);
    if (feeHandler.isNone) {
        return FeeHandlerType.UNDEFINED;
    }
    const feeHandlerName = feeHandler.unwrap().toString();
    switch (feeHandlerName) {
        case 'PercentageFeeHandler':
            return FeeHandlerType.PERCENTAGE;
        case 'BasicFeeHandler':
            return FeeHandlerType.BASIC;
        case 'DynamicFeeHandler':
            return FeeHandlerType.DYNAMIC;
        default:
            throw new Error('Invalid Fee Handler Type');
    }
};
//# sourceMappingURL=getFeeHandler.js.map