import { utils, BigNumber } from 'ethers';

export const toHex = (covertThis: any, padding: any) => {
	return utils.hexZeroPad(utils.hexlify(covertThis), padding);
};

export const addPadding = (covertThis: any, padding: number) => {
	return utils.hexZeroPad('0x'+ covertThis, padding);
};

export const createResourceID = (contractAddress: string, domainID: number) => {
	return toHex(contractAddress + toHex(domainID, 1).substr(2), 32)
};

export const createERCDepositData = (tokenAmountOrID: number | BigNumber, lenRecipientAddress: number, recipientAddress: string) => {
	return '0x' +
			toHex(tokenAmountOrID, 32).substr(2) +      // Token amount or ID to deposit (32 bytes)
			toHex(lenRecipientAddress, 32).substr(2) + // len(recipientAddress)          (32 bytes)
			recipientAddress.substr(2);               // recipientAddress               (?? bytes)
};