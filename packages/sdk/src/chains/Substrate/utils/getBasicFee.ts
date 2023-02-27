import { ApiPromise } from '@polkadot/api';
import type { Option, u128 } from '@polkadot/types';

/**
 * Retrieves the basic fee for a given domain and asset.
 *
 * @param {ApiPromise} api - The Substrate API instance.
 * @param {number} domainId - The ID of the domain.
 * @param {Object} xcmMultiAssetId - The XCM MultiAsset ID of the asset. {@link {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset}|More details}
 * @returns {Promise<Option<u128>>} A promise that resolves to an Option containing the basic fee as u128, or None if not found.
 */
export const getBasicFee = async (
  api: ApiPromise,
  domainId: number,
  xcmMultiAssetId: Object,
): Promise<Option<u128>> => {
  const feeRes = (await api.query.sygmaBasicFeeHandler.assetFees([
    domainId,
    xcmMultiAssetId,
  ])) as unknown as Option<u128>;
  return feeRes;
};
