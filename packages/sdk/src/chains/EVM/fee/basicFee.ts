import { BasicFeeHandler__factory as BasicFeeHandler } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';
import { FeeDataResult } from '../../../types';
import { createERCDepositData } from '../../../utils/helpers';

/**
 * Calculates and returns the feeData object after query the FeeOracle service
 *
 * @example
 * const basicFeeData = await calculateBasicfee({
 *   basicFeeHandlerAddress: '0x1234...',
 *   provider: new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID'),
 *   sender: '0x5678...',
 *   fromDomainID: '1',
 *   toDomainID: '2',
 *   resourceID: '0x00000...0001',
 *   tokenAmount: '100',
 *   recipientAddress: '0xdef0...',
 * });
 * console.log(basicFeeData);
 *
 * @category Fee
 * @param {Object} - Object to get the fee data
 * @returns {Promise<FeeDataResult>}
 */
export const calculateBasicfee = async ({
  basicFeeHandlerAddress,
  provider,
  sender,
  fromDomainID,
  toDomainID,
  resourceID,
  tokenAmount,
  recipientAddress,
}: {
  basicFeeHandlerAddress: string;
  provider: ethers.providers.Provider;
  sender: string;
  fromDomainID: string;
  toDomainID: string;
  resourceID: string;
  tokenAmount: string;
  recipientAddress: string;
}): Promise<FeeDataResult> => {
  const depositData = createERCDepositData(tokenAmount, recipientAddress);
  const feeData = '0x00';
  const BasicFeeHandlerInstance = BasicFeeHandler.connect(basicFeeHandlerAddress, provider);

  try {
    const calculatedFee = await BasicFeeHandlerInstance.calculateFee(
      sender,
      fromDomainID,
      toDomainID,
      resourceID,
      depositData,
      feeData,
    );
    console.log('calculatedFee', calculatedFee[0]);

    const [fee, address] = calculatedFee;
    return {
      fee,
      calculatedRate: ethers.utils.formatUnits(fee),
      erc20TokenAddress: address,
      feeData: fee.toHexString(),
      type: 'basic',
    };
  } catch (error) {
    console.error('Invalidad basic fee response', error);
    return Promise.reject(error);
  }
};
