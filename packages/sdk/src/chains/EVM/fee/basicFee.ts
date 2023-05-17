import { BasicFeeHandler__factory as BasicFeeHandler } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { FeeHandlerType } from '../../../types';
import { EvmFee } from '../types';

/**
 * Calculates and returns the fee in native currency.
 *
 * @example
 * import { ethers } from 'ethers';
 * import { calculateBasicfee } from '@buildwithsygma/sygma-sdk/EVM';
 * // also you can use valid alchemy API KEY
 * const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');
 * const basicFeeData = await calculateBasicfee({
 *   basicFeeHandlerAddress: '0x1234...',
 *   provider: new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID'),
 *   sender: '0x5678...',
 *   fromDomainID: 1,
 *   toDomainID: 2,
 *   resourceID: '0x00000...0001',
 * });
 * console.log(basicFeeData);
 * // {
 * //   type: 'basic',
 * //   fee: BigNumber { _hex: '0x0' },
 * //   calculatedRate: '0',
 * //   erc20TokenAddress: '0x00000000ABCD0000000000000000000000000000',
 * //   feeData: '0x0000000...HEX'
 * // }
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
}: {
  basicFeeHandlerAddress: string;
  provider: ethers.providers.Provider;
  sender: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
}): Promise<EvmFee> => {
  const BasicFeeHandlerInstance = BasicFeeHandler.connect(basicFeeHandlerAddress, provider);
  const calculatedFee = await BasicFeeHandlerInstance.calculateFee(
    sender,
    fromDomainID,
    toDomainID,
    resourceID,
    formatBytes32String(''),
    formatBytes32String(''),
  );

  const [fee] = calculatedFee;
  return {
    fee,
    feeData: fee.toHexString(),
    type: FeeHandlerType.BASIC,
    handlerAddress: basicFeeHandlerAddress,
  };
};
