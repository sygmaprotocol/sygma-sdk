import { FeeHandlerWithOracle__factory } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';
import fetch from 'node-fetch';
import EthCrypto from 'eth-crypto';

import { OracleResource, FeeDataResult } from '../types';
import { toHex, createERCDepositData } from '../utils/helpers';

type OracleResponse = {
  error?: string;
  response?: OracleResource;
};

export const createOracleFeeData = (
  oracleResponse: OracleResource,
  amount: number,
  tokenResource: string,
  oraclePrivateKey?: string,
): string => {
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

  let signature;
  if (oraclePrivateKey) {
    // temprorary signature generated with sign by private key
    const messageHash = EthCrypto.hash.keccak256([{ type: 'bytes', value: oracleMessage }]);
    signature = EthCrypto.sign(oraclePrivateKey, messageHash);
    return oracleMessage + signature.substr(2) + toHex(amount, 32).substr(2);
  } else {
    signature = oracleResponse.signature;
    return oracleMessage + signature + toHex(0, 32).substr(2);
  }
};

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
  overridedResourceId,
  oraclePrivateKey,
}: {
  provider: ethers.providers.Provider;
  sender: string;
  recipientAddress: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
  tokenAmount: number;
  feeOracleBaseUrl: string;
  feeOracleHandlerAddress: string;
  overridedResourceId?: string;
  oraclePrivateKey?: string;
}): Promise<FeeDataResult | undefined> => {
  const depositData = createERCDepositData(tokenAmount, 20, recipientAddress);
  let oracleResponse;
  try {
    oracleResponse = await requestFeeFromFeeOracle({
      feeOracleBaseUrl,
      fromDomainID,
      toDomainID,
      resourceID: overridedResourceId ? overridedResourceId : resourceID, // dirty hack for localsetup
    });
  } catch (e) {
    //@ts-ignore-line
    return e;
  }
  const feeData = createOracleFeeData(
    oracleResponse as OracleResource,
    tokenAmount,
    resourceID,
    oraclePrivateKey,
  );
  const FeeHandlerWithOracleInstance = FeeHandlerWithOracle__factory.connect(
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
}): Promise<OracleResource | undefined> => {
  try {
    const response = await fetch(
      `${feeOracleBaseUrl}/v1/rate/from/${fromDomainID}/to/${toDomainID}/resourceid/${resourceID}/gasLimit/${msgGasLimit}`,
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
    if (data.response) {
      return data.response;
    }
  } catch (e) {
    return Promise.reject(new Error('Invalid fee oracle response'));
  }
};
