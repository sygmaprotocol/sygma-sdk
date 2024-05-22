import { BigNumber } from 'ethers';
/**
 * Constructs the deposit data for a erc20 transaction.
 *
 * @example
 * // Amount of tokens:
 * const amount = '1';
 * // EVM address
 * const evmAddress = '0x1234567890123456789012345678901234567890';
 * createERCDepositData(amount, evmAddress);
 *
 *
 * @param {string} tokenAmount - The amount of tokens to be transferred.
 * @param {string} recipientAddress - The address of the recipient.
 * @param {number} parachainId - Optional parachain id if the substrate destination targets another parachain.
 * @returns {string} The deposit data as hex string
 */
export declare const createERCDepositData: (tokenAmount: string, recipientAddress: string, parachainId?: number) => string;
/**
 * Creates depositData for permissioned generic handler
 *
 * @category Helpers
 * @param hexMetaData
 * @returns {string}
 */
export declare const createPermissionedGenericDepositData: (hexMetaData: string) => string;
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
export declare const createPermissionlessGenericDepositData: (executeFunctionSignature: string, executeContractAddress: string, maxFee: string, depositor: string, executionData: string) => string;
/**
 * Converts a Substrate recipient address to a JSON multilocation.
 *
 * @param {string} recipientAddress - The recipient address as a string.
 * @returns {string} The recipient address as a stringified Substrate Multilocation Object
 */
export declare const constructSubstrateRecipient: (recipientAddress: string, parachainId?: number) => string;
/**
 * Converts a EVM recipient address to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string.
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
export declare const getEVMRecipientAddressInBytes: (recipientAddress: string) => Uint8Array;
/**
 * Converts a Substrate recipient multilocation to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
export declare const getSubstrateRecipientAddressInBytes: (recipientAddress: string, parachainId?: number) => Uint8Array;
/**
 * Return hex data padded to the number defined as padding
 * based on ethers.utils.hexZeroPad
 *
 * @category Helpers
 * @param covertThis - data to convert
 * @param padding - number to padd the data
 * @returns {string}
 */
export declare const toHex: (covertThis: string | number | BigNumber, padding: number) => string;
//# sourceMappingURL=helpers.d.ts.map