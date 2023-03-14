import { utils, BigNumber } from 'ethers';
import { decodeAddress } from '@polkadot/util-crypto';

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
 * @name constructMainDepositData
 * @description Constructs the main deposit data for a given token and recipient.
 * @param {BigNumber} tokenStats - The amount of ERC20 tokens or the token ID of ERC721 tokens.
 * @param {Uint8Array} destRecipient - The recipient address in bytes array
 * @returns {Uint8Array} The main deposit data in bytes array
 */
export const constructMainDepositData = (
  tokenStats: BigNumber,
  destRecipient: Uint8Array,
): Uint8Array => {
  const data: Uint8Array = utils.concat([
    utils.hexZeroPad(tokenStats.toHexString(), 32), // Amount (ERC20) or Token Id (ERC721)
    utils.hexZeroPad(BigNumber.from(destRecipient.length).toHexString(), 32), // length of recipient
    destRecipient, // Recipient
  ]);
  return data;
};

/**
 * Constructs the deposit data for an EVM-Substrate bridge transaction.
 *
 * @example
 * // EVM address
 * constructDepositDataEvmSubstrate('1', '0x1234567890123456789012345678901234567890', 18);
 *
 * @example
 * // Substrate address
 * constructDepositDataEvmSubstrate('2', '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt', 12);
 *
 * @param {string} tokenAmount - The amount of tokens to be transferred.
 * @param {string} recipientAddress - The address of the recipient.
 * @param {number} [decimals=18] - The number of decimals of the token.
 * @returns {string} The deposit data as hex string
 */
export const constructDepositDataEvmSubstrate = (
  tokenAmount: string,
  recipientAddress: string,
  decimals: number = 18,
): string => {
  const convertedAmount = utils.parseUnits(tokenAmount, decimals);
  // convert to bytes array
  const recipientAddressInBytes = utils.isAddress(recipientAddress)
    ? utils.arrayify(recipientAddress)
    : decodeAddress(recipientAddress);
  const depositDataBytes = constructMainDepositData(convertedAmount, recipientAddressInBytes);
  const depositData = utils.hexlify(depositDataBytes);
  return depositData;
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
