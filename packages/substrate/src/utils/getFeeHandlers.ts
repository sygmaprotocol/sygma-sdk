import type { XcmMultiAssetIdType } from '@buildwithsygma/core';
import { FeeHandlerType } from '@buildwithsygma/core';
import type { ApiPromise } from '@polkadot/api';
import type { Enum, Option } from '@polkadot/types';

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
export const getFeeHandler = async (
  api: ApiPromise,
  destinationDomainId: number,
  xcmMultiAssetId: XcmMultiAssetIdType,
): Promise<FeeHandlerType> => {
  const feeHandler = await api.query.sygmaFeeHandlerRouter.handlerType<Option<Enum>>([
    destinationDomainId,
    xcmMultiAssetId,
  ]);

  const feeHandlerName = feeHandler.unwrap().toString();

  switch (feeHandlerName) {
    case 'PercentageFeeHandler':
      return FeeHandlerType.PERCENTAGE;
    case 'BasicFeeHandler':
      return FeeHandlerType.BASIC;
    default:
      throw new Error('Invalid Fee Handler Type');
  }
};
