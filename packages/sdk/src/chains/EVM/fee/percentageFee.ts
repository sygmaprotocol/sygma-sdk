import { PercentageERC20FeeHandlerEVM__factory } from '@buildwithsygma/sygma-contracts';
import type { ethers } from 'ethers';
import { utils } from 'ethers';
import { FeeHandlerType } from '../../../types/index.js';
import type { PercentageFee } from '../types/index.js';

/**
 * Calculates and returns the fee in native currency.
 *
 * @category Fee
 * @param {Object} - Object to get the fee data
 * @returns {Promise<FeeDataResult>}
 */
export const getPercentageFee = async ({
  precentageFeeHandlerAddress,
  provider,
  sender,
  fromDomainID,
  toDomainID,
  resourceID,
  depositData,
}: {
  precentageFeeHandlerAddress: string;
  provider: ethers.providers.Provider;
  sender: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
  depositData: string;
}): Promise<PercentageFee> => {
  const percentageFeeHandlerContract = PercentageERC20FeeHandlerEVM__factory.connect(
    precentageFeeHandlerAddress,
    provider,
  );

  const calculatedFee = await percentageFeeHandlerContract.calculateFee(
    sender,
    fromDomainID,
    toDomainID,
    resourceID,
    depositData,
    utils.formatBytes32String(''),
  );

  const feeBounds = await percentageFeeHandlerContract._resourceIDToFeeBounds(resourceID);

  const feePercentage = (
    await percentageFeeHandlerContract._domainResourceIDToFee(toDomainID, resourceID)
  ).toNumber();
  const percentage = feePercentage / (await percentageFeeHandlerContract.HUNDRED_PERCENT());
  const [fee] = calculatedFee;
  return {
    fee,
    percentage,
    feeData: fee.toHexString(),
    type: FeeHandlerType.PERCENTAGE,
    handlerAddress: precentageFeeHandlerAddress,
    lowerBound: feeBounds.lowerBound,
    upperBound: feeBounds.upperBound,
  };
};
