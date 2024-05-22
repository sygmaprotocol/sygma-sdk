import { BN } from '@polkadot/util';
import { FeeHandlerType } from '../../../types/index.js';
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
export const getBasicFee = async (api, destinationDomainId, xcmMultiAssetId) => {
    const rawFee = await api.query.sygmaBasicFeeHandler.assetFees([
        destinationDomainId,
        xcmMultiAssetId,
    ]);
    if (rawFee.isNone) {
        throw new Error('Error retrieving fee');
    }
    return {
        fee: new BN(rawFee.unwrap()),
        type: FeeHandlerType.BASIC,
    };
};
//# sourceMappingURL=getBasicFee.js.map