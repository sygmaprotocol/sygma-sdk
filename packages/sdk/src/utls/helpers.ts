import { utils } from 'ethers';
// TODO: add proper types

export const toHex = (covertThis: any, padding: any) => {
	return utils.hexZeroPad(utils.hexlify(covertThis), padding);
};

export const addPadding = (covertThis: any, padding: any) => {
	return utils.hexZeroPad('0x'+ covertThis, padding);
};

export const createResourceID = (contractAddress: any, domainID: any) => {
	return toHex(contractAddress + toHex(domainID, 1).substr(2), 32)
};

export const createERCDepositData = (tokenAmountOrID: any, lenRecipientAddress: number, recipientAddress: string) => {
	return '0x' +
			toHex(tokenAmountOrID, 32).substr(2) +      // Token amount or ID to deposit (32 bytes)
			toHex(lenRecipientAddress, 32).substr(2) + // len(recipientAddress)          (32 bytes)
			recipientAddress.substr(2);               // recipientAddress               (?? bytes)
};