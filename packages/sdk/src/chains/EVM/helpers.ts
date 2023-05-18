import { utils, BigNumber, providers } from 'ethers';
import { TypeRegistry } from '@polkadot/types/create';
import { ERC20 } from '@buildwithsygma/sygma-contracts';

const registry = new TypeRegistry();

/**
 * Return hex data padded to the number defined as padding
 * based on ethers.utils.hexZeroPad
 *
 * @category Helpers
 * @param covertThis - data to convert
 * @param padding - number to padd the data
 * @returns {string}
 */
export const toHex = (covertThis: string | number | BigNumber, padding: number): string => {
  const amount = covertThis instanceof BigNumber ? covertThis : BigNumber.from(covertThis);
  return utils.hexZeroPad(utils.hexlify(amount), padding);
};

/**
 * Pads the data
 * based on ethers.utils.hexZeroPad
 *
 * @category Helpers
 * @param covertThis - data to convert
 * @param padding - padding
 * @returns {string}
 */
export const addPadding = (covertThis: string | number, padding: number): string => {
  return utils.hexZeroPad(`0x${covertThis}`, padding);
};

/**
 * Constructs the deposit data for an EVM-Substrate bridge transaction.
 *
 * @example
 * // Amount of tokens:
 * const amount = '1';
 * // EVM address
 * const evmAddress = '0x1234567890123456789012345678901234567890';
 * // Decimals of the token
 * const decimals = 18;
 * createERCDepositData(amount, evmAddress, decimals);
 *
 * @example
 * import { decodeAddress } from '@polkadot/util-crypto';
 * // Substrate MultiLocation
 * // Decode address to bytes of public key
 * const addressPublicKeyInBytes = decodeAddress(
 *   '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt',
 * );
 * // Convert bytes of public key to hex string
 * const addressPublicKeyHexString = ethers.utils.hexlify(addressPublicKeyInBytes);
 * // console.log(addressPublicKeyHexString) => "0x06a220edf5f82b84fc5f9270f8a30a17636bf29c05a5c16279405ca20918aa39"
 * const multiLocation = JSON.stringify({
 *   parents: 0,
 *     interior: {
 *       X1: {
 *         AccountId32: {
 *           network: { any: null },
 *           id: addressPublicKeyHexString,
 *         },
 *       },
 *     },
 *   })
 * // Amount of tokens:
 * const amount = '2';
 * createERCDepositData(amount, multiLocation);
 *
 * @param {string} tokenAmount - The amount of tokens to be transferred.
 * @param {string} recipientAddress - The address of the recipient.
 * @param {number} [decimals=18] - The number of decimals of the token.
 * @returns {string} The deposit data as hex string
 */
export const createERCDepositData = (
  tokenAmount: string,
  recipientAddress: string,
  decimals = 18,
): string => {
  const convertedAmount = utils.parseUnits(tokenAmount, decimals);
  const recipientAddressInBytes = getRecipientAddressInBytes(recipientAddress);
  const depositDataBytes = constructMainDepositData(convertedAmount, recipientAddressInBytes);
  const depositData = utils.hexlify(depositDataBytes);

  return depositData;
};

/**
 * Converts a recipient address to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, either as a string (EVM address) or a JSON object (Substrate multilocation).
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
export const getRecipientAddressInBytes = (recipientAddress: string): Uint8Array => {
  if (utils.isAddress(recipientAddress)) {
    // EVM address
    return utils.arrayify(recipientAddress);
  }

  // Substrate multilocation
  return registry.createType('MultiLocation', JSON.parse(recipientAddress)).toU8a();
};

/**
 * Constructs the main deposit data for a given token and recipient.
 *
 * @category Helpers
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
 * Creates depositData for permissioned generic handler
 *
 * @category Helpers
 * @param hexMetaData
 * @returns {string}
 */
export const createPermissionedGenericDepositData = (hexMetaData: string): string => {
  const hexMetaDataLength = hexMetaData.substr(2).length / 2;
  return '0x' + toHex(hexMetaDataLength, 32).substr(2) + hexMetaData.substr(2);
};

/**
 * Creates the data for permissionless generic handler
 *
 * @category Helpers
 * @param executeFunctionSignature - execution function signature
 * @param executeContractAddress - execution contract address
 * @param maxFee - max fee defined
 * @param depositor - address of depositor on source chain
 * @param executionData - the data to pass as parameter of the function being called on destination chain
 * @returns {string}
 */
export const createPermissionlessGenericDepositData = (
  executeFunctionSignature: string,
  executeContractAddress: string,
  maxFee: string,
  depositor: string,
  executionData: string,
): string => {
  return (
    '0x' +
    toHex(maxFee, 32).substr(2) + // uint256
    toHex(executeFunctionSignature.substr(2).length / 2, 2).substr(2) + // uint16
    executeFunctionSignature.substr(2) + // bytes
    toHex(executeContractAddress.substr(2).length / 2, 1).substr(2) + // uint8
    executeContractAddress.substr(2) + // bytes
    toHex(depositor.substr(2).length / 2, 1).substr(2) + // uint8
    depositor.substr(2) +
    executionData.substr(2)
  ) // bytes
    .toLowerCase();
};
/**
 * Gets the number of decimals for an ERC20 token.
 *
 * @category Helpers
 * @param {ERC20} tokenInstance - An instance of an ERC20 token.
 * @returns {Promise<number>} - A promise that resolves with the number of decimals for the token.
 * @throws Error if the input token instance is not an ERC20 token.
 */
export async function getTokenDecimals(tokenInstance: ERC20): Promise<number> {
  if (isERC20(tokenInstance)) {
    return await tokenInstance.decimals();
  } else {
    throw new Error('Token instance is not ERC20');
  }
}
/**
 * Type guard function that determines if a given object is an instance of the ERC20 interface.
 *
 * @category Helpers
 * @param {ERC20} tokenInstance - The object to be checked.
 * @returns {boolean} - Returns `true` if the object is an instance of ERC20, `false` otherwise.
 */
export function isERC20(tokenInstance: ERC20): tokenInstance is ERC20 {
  return 'decimals' in tokenInstance;
}

/**
 * Checks if a given value is a number within the range of 0 and 255.
 *
 * @category Helpers
 * @param {unknown} value - The value to check.
 * @returns {boolean} - `true` if the number is within the range of 0 and 255, otherwise `false`.
 */
export const isUint8 = (value: unknown): boolean => {
  const bn = BigNumber.from(value);
  return bn.gte(0) && bn.lte(255);
};

/**
 * Check the fee data of the provider and returns the gas price if the node is not EIP1559
 *
 * @category Helpers
 * @param provider - JsonRpcProvider | Web3Provider
 * @returns {Promise<BigNumber | boolean>}
 */
export async function isEIP1559MaxFeePerGas(provider: providers.Provider): Promise<BigNumber> {
  try {
    const feeData = await provider.getFeeData();
    const { gasPrice } = feeData;
    return gasPrice as BigNumber;
  } catch (error) {
    console.error('error getting EIP 1559', error);
    return Promise.reject(error);
  }
}
