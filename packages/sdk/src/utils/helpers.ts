import { utils, BigNumber } from 'ethers';

export const toHex = (covertThis: string | number | BigNumber, padding: number): string => {
  return utils.hexZeroPad(utils.hexlify(BigNumber.from(covertThis)), padding);
};

export const addPadding = (covertThis: string | number, padding: number): string => {
  return utils.hexZeroPad(`0x${covertThis}`, padding);
};

export const createResourceID = (contractAddress: string, domainID: number): string => {
  return toHex(contractAddress + toHex(domainID, 1).substr(2), 32);
};

export const createERCDepositData = (
  tokenAmountOrID: string | number | BigNumber,
  lenRecipientAddress: number,
  recipientAddress: string,
): string => {
  return (
    '0x' +
    toHex(tokenAmountOrID, 32).substr(2) + // Token amount or ID to deposit (32 bytes)
    toHex(lenRecipientAddress, 32).substr(2) + // len(recipientAddress)          (32 bytes)
    recipientAddress.substr(2)
  ); // recipientAddress               (?? bytes)
};

export const createGenericDepositDataV1 = (
  executeFunctionSignature: string,
  executeContractAddress: string,
  maxFee: string,
  depositor: string,
  executionData: string,
  depositorCheck = true,
): string => {
  let metaData = toHex(depositor, 32).substr(2) + executionData.substr(2);

  if (depositorCheck) {
    // if "depositorCheck" is true -> append depositor address for destination chain check
    metaData = metaData.concat(toHex(depositor, 32).substr(2));
  }

  const metaDataLength = metaData.length / 2;

  return (
    '0x' +
    toHex(metaDataLength, 32).substr(2) + // len(metaData) (32 bytes)
    toHex(executeFunctionSignature, 32).substr(2) + // bytes4        (padded to 32 bytes)
    toHex(executeContractAddress, 32).substr(2) + // address       (padded to 32 bytes)
    toHex(maxFee, 32).substr(2) + // uint256
    metaData
  ); // bytes
};
