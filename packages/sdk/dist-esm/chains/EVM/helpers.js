import { utils, BigNumber } from 'ethers';
import { TypeRegistry } from '@polkadot/types/create';
import { decodeAddress } from '@polkadot/util-crypto';
const registry = new TypeRegistry();
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
export const createERCDepositData = (tokenAmount, recipientAddress, parachainId) => {
    let recipientAddressInBytes;
    if (utils.isAddress(recipientAddress)) {
        recipientAddressInBytes = getEVMRecipientAddressInBytes(recipientAddress);
    }
    else {
        recipientAddressInBytes = getSubstrateRecipientAddressInBytes(recipientAddress, parachainId);
    }
    const depositDataBytes = constructMainDepositData(BigNumber.from(tokenAmount), recipientAddressInBytes);
    const depositData = utils.hexlify(depositDataBytes);
    return depositData;
};
/**
 * Constructs the main deposit data for a given token and recipient.
 *
 * @category Helpers
 * @param {BigNumber} tokenStats - The amount of ERC20 tokens or the token ID of ERC721 tokens.
 * @param {Uint8Array} destRecipient - The recipient address in bytes array
 * @returns {Uint8Array} The main deposit data in bytes array
 */
const constructMainDepositData = (tokenStats, destRecipient) => {
    const data = utils.concat([
        utils.hexZeroPad(tokenStats.toHexString(), 32),
        utils.hexZeroPad(BigNumber.from(destRecipient.length).toHexString(), 32),
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
export const createPermissionedGenericDepositData = (hexMetaData) => {
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
export const createPermissionlessGenericDepositData = (executeFunctionSignature, executeContractAddress, maxFee, depositor, executionData) => {
    return ('0x' +
        toHex(maxFee, 32).substr(2) + // uint256
        toHex(executeFunctionSignature.substr(2).length / 2, 2).substr(2) + // uint16
        executeFunctionSignature.substr(2) + // bytes
        toHex(executeContractAddress.substr(2).length / 2, 1).substr(2) + // uint8
        executeContractAddress.substr(2) + // bytes
        toHex(depositor.substr(2).length / 2, 1).substr(2) + // uint8
        depositor.substr(2) +
        executionData.substr(2)) // bytes
        .toLowerCase();
};
/**
 * Converts a Substrate recipient address to a JSON multilocation.
 *
 * @param {string} recipientAddress - The recipient address as a string.
 * @returns {string} The recipient address as a stringified Substrate Multilocation Object
 */
export const constructSubstrateRecipient = (recipientAddress, parachainId) => {
    const addressPublicKeyBytes = decodeAddress(recipientAddress);
    const addressPublicKeyHexString = utils.hexlify(addressPublicKeyBytes);
    if (parachainId) {
        return JSON.stringify({
            parents: 1,
            interior: {
                X2: [
                    {
                        parachain: parachainId,
                    },
                    {
                        AccountId32: {
                            network: { any: null },
                            id: addressPublicKeyHexString,
                        },
                    },
                ],
            },
        });
    }
    return JSON.stringify({
        parents: 0,
        interior: {
            X1: {
                AccountId32: {
                    network: { any: null },
                    id: addressPublicKeyHexString,
                },
            },
        },
    });
};
/**
 * Converts a EVM recipient address to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string.
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
export const getEVMRecipientAddressInBytes = (recipientAddress) => {
    return utils.arrayify(recipientAddress);
};
/**
 * Converts a Substrate recipient multilocation to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
export const getSubstrateRecipientAddressInBytes = (recipientAddress, parachainId) => {
    const result = registry
        .createType('MultiLocation', JSON.parse(constructSubstrateRecipient(recipientAddress, parachainId)))
        .toU8a();
    return result;
};
/**
 * Return hex data padded to the number defined as padding
 * based on ethers.utils.hexZeroPad
 *
 * @category Helpers
 * @param covertThis - data to convert
 * @param padding - number to padd the data
 * @returns {string}
 */
export const toHex = (covertThis, padding) => {
    const amount = covertThis instanceof BigNumber ? covertThis : BigNumber.from(covertThis);
    return utils.hexZeroPad(utils.hexlify(amount), padding);
};
//# sourceMappingURL=helpers.js.map