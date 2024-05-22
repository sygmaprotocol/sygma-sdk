import type { ApiPromise } from '@polkadot/api';
import { FeeHandlerType } from '../../../types/index.js';
import type { XcmMultiAssetIdType } from '../types/index.js';
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
export declare const getFeeHandler: (api: ApiPromise, destinationDomainId: number, xcmMultiAssetId: XcmMultiAssetIdType) => Promise<FeeHandlerType>;
//# sourceMappingURL=getFeeHandler.d.ts.map