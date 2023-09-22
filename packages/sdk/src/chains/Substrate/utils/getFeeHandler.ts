import { ApiPromise } from '@polkadot/api';
import { Enum, Option } from '@polkadot/types';
import { FeeHandlerType } from '../../../types';
import { XcmMultiAssetIdType } from '../types';
/**
 * Retrieves the fee handler for a given domainId and asset.
 *
 * @category Fee
 * @param {ApiPromise} api - The Substrate API instance.
 * @param {number} domainId - The ID of the domain.
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

  if (feeHandler.isNone) {
    throw new Error('No Fee Handler configured');
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
