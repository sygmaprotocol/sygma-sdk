import { DynamicERC20FeeHandlerEVM__factory } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';
import fetch from 'cross-fetch';

import { OracleResource, FeeDataResult } from '../../../types';
import { toHex, constructDepositDataEvmSubstrate } from '../../../utils/helpers';

type OracleResponse = {
  error?: string;
  response?: OracleResource;
};

/**
 * Creates feeData structure with the following parameters.
 *
 * @param {object} oracleResponse - Response received from the Oracle resource.
 * @param {string} amount - Amount in string format.
 * @returns {string} - Returns the oracleMessage, signature and amount.
 */
export const createOracleFeeData = (oracleResponse: OracleResource, amount: string): string => {
  /*
        feeData structure:
            ber*10^18:    uint256
            ter*10^18:    uint2a56
            dstGasPrice:  uint256
            timestamp:    uint256
            fromDomainID: uint8 encoded as uint256
            toDomainID:   uint8 encoded as uint256
            resourceID:   bytes32
            msgGasLimit:  uint256
            sig:          bytes(65 bytes)

        total in bytes:
        message:
            32 * 8  = 256
        message + sig:
            256 + 65 = 321

            amount: uint256
        total feeData length: 353
    */

  const oracleMessage = ethers.utils.solidityPack(
    ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes32', 'uint256'],
    [
      ethers.utils.parseEther(oracleResponse.baseEffectiveRate),
      ethers.utils.parseEther(oracleResponse.tokenEffectiveRate),
      ethers.utils.parseUnits(oracleResponse.dstGasPrice, 'wei'),
      oracleResponse.expirationTimestamp,
      oracleResponse.fromDomainID,
      oracleResponse.toDomainID,
      oracleResponse.resourceID,
      oracleResponse.msgGasLimit,
    ],
  );

  const signature = oracleResponse.signature;
  return oracleMessage + signature + toHex(amount, 32).substring(2);
};

/**
 * @name calculatedFeeData
 * @description calculates the fee data after query the FeeOracle service
 * @param {Object} - object provided to calculate the fee data after query oracle service
 * @returns {Promise<FeeDataResult | undefined>}
 */
export const calculateFeeData = async ({
  provider,
  sender,
  recipientAddress,
  fromDomainID,
  toDomainID,
  resourceID,
  tokenAmount,
  feeOracleBaseUrl,
  feeOracleHandlerAddress,
}: {
  provider: ethers.providers.Provider;
  sender: string;
  recipientAddress: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
  tokenAmount: string;
  feeOracleBaseUrl: string;
  feeOracleHandlerAddress: string;
}): Promise<FeeDataResult | undefined> => {
  const depositData = constructDepositDataEvmSubstrate(tokenAmount, recipientAddress);

  let oracleResponse;
  try {
    oracleResponse = await requestFeeFromFeeOracle({
      feeOracleBaseUrl,
      fromDomainID,
      toDomainID,
      resourceID,
    });
  } catch (e) {
    return Promise.reject(e);
  }
  const feeData = createOracleFeeData(oracleResponse as OracleResource, tokenAmount);
  const FeeHandlerWithOracleInstance = DynamicERC20FeeHandlerEVM__factory.connect(
    feeOracleHandlerAddress,
    provider,
  );
  const res = await FeeHandlerWithOracleInstance.calculateFee(
    sender,
    fromDomainID,
    toDomainID,
    resourceID,
    depositData,
    feeData,
  );
  const result: FeeDataResult = {
    fee: res.fee,
    calculatedRate: ethers.utils.formatEther(res.fee.toString()),
    erc20TokenAddress: res.tokenAddress,
    feeData,
    type: 'feeOracle',
  };
  return result;
};

/**
 * Fetches oracle resource data from the FeeOracle service.

 * @param {Object} options - The options for the request.
 * @param {string} options.feeOracleBaseUrl - The base URL for the FeeOracle service.
 * @param {number} options.fromDomainID - The domain ID of the sending domain.
 * @param {number} options.toDomainID - The domain ID of the receiving domain.
 * @param {string} options.resourceID - The ID of the requested resource.
 * @param {number} [options.msgGasLimit=0] - The gas limit for the message (optional, defaults to 0).
 * @return {Promise<OracleResource>} - A Promise that resolves to the OracleResource data, or undefined if it is not available.
 */
export const requestFeeFromFeeOracle = async ({
  feeOracleBaseUrl,
  fromDomainID,
  toDomainID,
  resourceID,
  msgGasLimit = 0,
}: {
  feeOracleBaseUrl: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
  msgGasLimit?: number;
}): Promise<OracleResource> => {
  try {
    const response = await fetch(
      `${feeOracleBaseUrl}/v1/rate/from/${fromDomainID}/to/${toDomainID}/resourceid/${resourceID}?gasLimit=${msgGasLimit}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    );
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    const data = (await response.json()) as OracleResponse;
    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.response) {
      throw new Error('Empty response data from fee oracle service');
    }

    return data.response;
  } catch (e) {
    console.error('Request to FeeOracle service failed');
    return Promise.reject(e);
  }
};
