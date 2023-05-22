import { ApiPromise } from '@polkadot/api';
import type { Option, u128 } from '@polkadot/types';
import { FeeHandlerType } from 'types';
import { BigNumber } from 'ethers';
import { SubstrateFee } from '../types';

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
 * @param {Object} xcmMultiAssetId - The XCM MultiAsset ID of the asset. {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset | More details}
 * @returns {Promise<SubstrateFee>} A promise that resolves to a SubstrateFee object.
 * @throws {Error} Unable to retrieve fee from pallet
 */
export const getBasicFee = async (
  api: ApiPromise,
  domainId: number,
  xcmMultiAssetId: Object,
): Promise<SubstrateFee> => {
  const rawFee = (await api.query.sygmaBasicFeeHandler.assetFees([
    domainId,
    xcmMultiAssetId,
  ])) as unknown as Option<u128>;

  if (rawFee.isNone) {
    throw new Error('Error fetching basic fee from pallet');
  }

  return {
    fee: BigNumber.from(rawFee.unwrap.toString()),
    type: FeeHandlerType.BASIC,
  };
};
