import { PercentageFeeHandler__factory } from '@panterazar/sygma-contracts';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { FeeHandlerType } from '../../../types/index.js';
import { EvmFee } from '../types/index.js';

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
}): Promise<EvmFee> => {
  const percentageFeeHandlerContract = PercentageFeeHandler__factory.connect(
    precentageFeeHandlerAddress,
    provider,
  );
  const calculatedFee = await percentageFeeHandlerContract.calculateFee(
    sender,
    fromDomainID,
    toDomainID,
    resourceID,
    depositData,
    formatBytes32String(''),
  );

  const [fee] = calculatedFee;
  return {
    fee,
    feeData: fee.toHexString(),
    type: FeeHandlerType.PERCENTAGE,
    handlerAddress: precentageFeeHandlerAddress,
  };
};
