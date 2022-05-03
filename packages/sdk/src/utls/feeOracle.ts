import { Bridge, FeeHandlerWithOracle, Bridge__factory, ERC20Handler__factory, FeeHandlerWithOracle__factory} from '@chainsafe/chainbridge-contracts';
import { utils, BigNumber, ethers } from 'ethers';
import fetch from 'node-fetch';
import EthCrypto from 'eth-crypto';

import { toHex, addPadding, createResourceID, createERCDepositData } from './helpers';

type OracleResource = {
	baseEffectiveRate: string;
	tokenEffectiveRate:  string;
	dstGasPrice: string;
	signature: string;
	fromDomainID: number;
	toDomainID: number;
	resourceID: string;
	dataTimestamp: number;
	signatureTimestamp: number;
	expirationTimestamp: number;
}


const createOracleFeeData = (oracleResponse: OracleResource, amount: any, tokenResource: any) => {
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
		addPadding(tokenResource.substr(2) + toHex(oracleResponse.fromDomainID, 1).substr(2), 32).substr(2)

	// const signature = oracleResponse.signature;
	// return oracleMessage + signature + toHex(0, 32).substr(2);

	// temprorary signature generated with sign by private key
	const messageHash = EthCrypto.hash.keccak256([{type: "bytes",value: oracleMessage}]);
	const signature = EthCrypto.sign('0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e', messageHash);
	return oracleMessage + signature.substr(2) + toHex(amount, 32).substr(2);
}

export const calculateFeeData = async ({
	provider,
	sender,
	recipientAddress,
	fromDomainID,
	toDomainID,
	tokenResource,
	tokenAmount,
	feeOracleBaseUrl,
	feeOracleHandlerAddress
}: {
	provider: ethers.providers.JsonRpcProvider;
	sender: string;
	recipientAddress: string;
	fromDomainID: number;
	toDomainID: number;
	tokenResource: string;
	tokenAmount: number,
	feeOracleBaseUrl: string;
	feeOracleHandlerAddress: string;
}) => {
	const resourceID = createResourceID(tokenResource, fromDomainID);
	// console.log('🚀 ~ file: feeOracle.ts ~ line 90 ~ calculateFeeData ~ resourceID', resourceID);

	// const tokenAmount = 100;
	const depositData = createERCDepositData(tokenAmount, 20, recipientAddress);
	// console.log('🚀 ~ file: feeOracle.ts ~ line 100 ~ calculateFeeData ~ depositData', depositData);

	const oracleResponse = await requestFeeFromFeeOracle(
		feeOracleBaseUrl,
		fromDomainID,
		toDomainID,
		// tokenResource,
		'0xbA2aE424d960c26247Dd6c32edC70B295c744C43', // dirty hack for localsetup
	);
	console.log('🔭 ~ oracleResponse', oracleResponse);
	if (oracleResponse) {
		const feeData = createOracleFeeData(oracleResponse, tokenAmount, tokenResource);
		// console.log('🚀 ~ file: feeOracle.ts ~ line 109 ~ calculateFeeData ~ feeData', feeData);

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
			erc20TokenAddress: res.tokenAddress
		}
    console.log('⛓️  ~ formatted result of feeHandler', result)
		return result
	}
};

export const requestFeeFromFeeOracle = async (
	feeOracleHost: string,
	fromDomainId: number,
	toDomainId: number,
	resourceId: string,
) => {
	// http://localhost:8091/v1/rate/from/2/to/1/token/0x8A953CfE442c5E8855cc6c61b1293FA648BAE4722
	try {
		const response = await fetch(
			`${feeOracleHost}/v1/rate/from/${fromDomainId}/to/${toDomainId}/token/${resourceId}`,
		);
		if (response.status !== 200) {
			throw new Error(response.statusText)

		}
		const data = await response.json();
		if (data.error) {
			throw new Error(data.error)
		}
		if (data.response) {
			return data.response as OracleResource;
		}
	} catch (e) {
		console.error(e);
	}
};


