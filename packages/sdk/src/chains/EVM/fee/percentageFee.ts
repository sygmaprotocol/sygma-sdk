import { PercentageERC20FeeHandlerEVM__factory } from '@buildwithsygma/sygma-contracts';
import { ethers, utils } from 'ethers';
import { FeeHandlerType } from '../../../types';
import { EvmFee } from '../types';

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

  const [fee] = calculatedFee;
  return {
    fee,
    feeData: fee.toHexString(),
    type: FeeHandlerType.PERCENTAGE,
    handlerAddress: precentageFeeHandlerAddress,
  };
};
