import type { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import type { Option, Tuple } from '@polkadot/types';
import type { SubstrateFee } from '../types/index.js';
import type { Fungible, Transfer, SubstrateResource } from '../../../types/index.js';
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
export const getPercentageFee = async (
  api: ApiPromise,
  transfer: Transfer<Fungible>,
): Promise<SubstrateFee> => {
  const assetId = (transfer.resource as SubstrateResource).xcmMultiAssetId;

  const feeStructure = await api.query.sygmaPercentageFeeHandler.assetFeeRate<Option<Tuple>>([
    transfer.to.id,
    assetId,
  ]);
  if (feeStructure.isNone) {
    throw new Error('Error retrieving fee');
  }

  const [feeRate, min, max] = feeStructure
    .unwrap()
    .toArray()
    .map(val => new BN(val.toString()));

  const calculatedFee = new BN(transfer.details.amount).mul(feeRate).div(new BN(10000));

  let fee: BN;
  if (calculatedFee.lt(min)) {
    fee = min;
  } else if (calculatedFee.gt(max)) {
    fee = max;
  } else {
    fee = calculatedFee;
  }

  return {
    fee: fee,
    type: FeeHandlerType.PERCENTAGE,
  };
};
