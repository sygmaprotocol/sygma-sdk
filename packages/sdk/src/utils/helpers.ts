import { utils, BigNumber } from 'ethers';

/**
 * @name toHex
 * @description return hex data padded to the number defined as padding
 * @param covertThis - data to convert
 * @param padding - number to padd the data
 * @returns {string}
 */
export const toHex = (covertThis: string | number | BigNumber, padding: number): string => {
  const amount = covertThis instanceof BigNumber ? covertThis : BigNumber.from(covertThis);
  return utils.hexZeroPad(utils.hexlify(amount), padding);
};

/**
 * @name addPadding
 * @description pads the data
 * @param covertThis - data to convert
 * @param padding - padding
 * @returns {string}
 */
export const addPadding = (covertThis: string | number, padding: number): string => {
  return utils.hexZeroPad(`0x${covertThis}`, padding);
};

/**
 * @name createResourceID
 * @description creates a resource id based on the contract address
 * @param contractAddress
 * @param domainID
 * @returns {string}
 */
export const createResourceID = (contractAddress: string, domainID: number): string => {
  return toHex(contractAddress + toHex(domainID, 1).substr(2), 32);
};

/**
 * @name createERCDepositData
 * @description creates the deposit data to use on bridge.deposit method interface
 * @param tokenAmountOrID - number | string | BigNumber of the amount of token or Id fo the token
 * @param lenRecipientAddress
 * @param recipientAddress
 * @returns {string}
 */
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

/**
 * @name createPermissionedGenericDepositData
 * @description creates data for permissioned generic handler
 * @param hexMetaData
 * @returns {string}
 */
export const createPermissionedGenericDepositData = (hexMetaData: string): string => {
  if (hexMetaData === null) {
    return '0x' + toHex(0, 32).substr(2); // len(metaData) (32 bytes)
  }
  const hexMetaDataLength = hexMetaData.substr(2).length / 2;
  return '0x' + toHex(hexMetaDataLength, 32).substr(2) + hexMetaData.substr(2);
};

/**
 * @name createPermissionlessGenericDepositData
 * @description creates the data for permissionless generic handler
 * @param executeFunctionSignature - execution function signature
 * @param executeContractAddress - execution contract address
 * @param maxFee - max fee defined
 * @param depositor - address of depositor on destination chain
 * @param executionData - the data to pass as parameter of the function being called on destination chain
 * @param depositorCheck - true if you want to check depositor
 * @returns {string}
 */
export const createPermissionlessGenericDepositData = (
  executeFunctionSignature: string,
  executeContractAddress: string,
  maxFee: string,
  depositor: string,
  executionData: string,
  depositorCheck: boolean = true,
): string => {
  if (depositorCheck) {
    // if "depositorCheck" is true -> append depositor address for destination chain check
    executionData = executionData.concat(toHex(depositor, 32).substr(2));
  }
  return (
    '0x' +
    toHex(maxFee, 32).substr(2) + // uint256
    toHex(executeFunctionSignature.substr(2).length / 2, 2).substr(2) + // uint16
    executeFunctionSignature.substr(2) + // bytes
    toHex(executeContractAddress.substr(2).length / 2, 1).substr(2) + // uint8
    executeContractAddress.substr(2) + // bytes
    toHex(32, 1).substr(2) + // uint8
    toHex(depositor, 32).substr(2) + // bytes32
    executionData.substr(2)
  ) // bytes
    .toLowerCase();
};
