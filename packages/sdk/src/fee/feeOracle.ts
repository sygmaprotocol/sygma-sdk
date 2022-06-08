import {
  FeeHandlerWithOracle__factory,
} from '@chainsafe/chainbridge-contracts';
import { utils, BigNumber, ethers } from 'ethers';
import fetch from 'node-fetch';
import EthCrypto from 'eth-crypto';

import { OracleResource, FeeOracleResult } from '../types';
import { toHex, addPadding, createResourceID, createERCDepositData } from '../utils/helpers';

export const createOracleFeeData = (
  oracleResponse: OracleResource,
  amount: any,
  tokenResource: any,
  oraclePrivateKey?: string,
) => {
    /*
        feeData structure:
            ber*10^18: uint256
            ter*10^18: uint256
            dstGasPrice: uint256
            timestamp: uint256
            fromDomainID: uint8 encoded as uint256
            toDomainID: uint8 encoded as uint256
            resourceID: bytes32
            sig: bytes(65 bytes)

        total in bytes:
        message:
            32 * 7  = 224
        message + sig:
            224 + 65 = 289

            amount: uint256
        total feeData length: 321
    */

  const oracleMessage =
    '0x' +
    toHex(ethers.utils.parseEther(oracleResponse.baseEffectiveRate), 32).substr(2) + // ber*10^18: uint256 (32 bytes)
    toHex(ethers.utils.parseEther(oracleResponse.tokenEffectiveRate), 32).substr(2) + // ter*10^18: uint256 (32 bytes)
    toHex(ethers.utils.parseUnits(oracleResponse.dstGasPrice, 'wei'), 32).substr(2) + // dstGasPrice: uint256 (32 bytes)
    toHex(oracleResponse.expirationTimestamp, 32).substr(2) + // timestamp: uint256
    toHex(oracleResponse.fromDomainID, 32).substr(2) + // fromDomainID: uint256
    toHex(oracleResponse.toDomainID, 32).substr(2) + // toDomainID: uint256
    // addPadding(oracleResponse.resourceID, 32).substr(2); // resourceID: bytes32
    addPadding(
      tokenResource.substr(2) + toHex(oracleResponse.fromDomainID, 1).substr(2),
      32,
    ).substr(2);

    let signature
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
  tokenResource,
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
  tokenResource: string;
  tokenAmount: string;
  feeOracleBaseUrl: string;
  feeOracleHandlerAddress: string;
  overridedResourceId?: string;
  oraclePrivateKey?: string;
}): Promise<FeeOracleResult | undefined> => {
  const resourceID = createResourceID(tokenResource, fromDomainID);
  const depositData = createERCDepositData(tokenAmount, 20, recipientAddress);
  let oracleResponse;
  try {
    oracleResponse = await requestFeeFromFeeOracle({
      feeOracleBaseUrl,
      fromDomainID,
      toDomainID,
      // tokenResource,
      resourceID: overridedResourceId ? overridedResourceId : tokenResource, // dirty hack for localsetup
    });
  } catch (e: any) {
    return e;
  }
  const feeData = createOracleFeeData(
    oracleResponse as OracleResource,
    tokenAmount,
    tokenResource,
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
  const result = {
    calculatedRate: ethers.utils.formatEther(res.fee.toString()),
    erc20TokenAddress: res.tokenAddress,
    feeData,
  };
  console.log('⛓️  ~ formatted result of feeHandler', result);
  return result;
};

export const requestFeeFromFeeOracle = async ({
  feeOracleBaseUrl,
  fromDomainID,
  toDomainID,
  resourceID,
}: {
  feeOracleBaseUrl: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
}) => {
  try {
    const response = await fetch(
      `${feeOracleBaseUrl}/v1/rate/from/${fromDomainID}/to/${toDomainID}/token/${resourceID}`,
    );
    if (response.status !== 200) {
      throw(new Error(response.statusText));
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    if (data.response) {
      return data.response as OracleResource;
    }
  } catch (e) {
    return Promise.reject(new Error("Invalid fee oracle response"))
  }
};
