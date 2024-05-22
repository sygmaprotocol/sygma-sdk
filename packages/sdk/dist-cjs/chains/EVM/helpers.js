"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = exports.getSubstrateRecipientAddressInBytes = exports.getEVMRecipientAddressInBytes = exports.constructSubstrateRecipient = exports.createPermissionlessGenericDepositData = exports.createPermissionedGenericDepositData = exports.createERCDepositData = void 0;
const ethers_1 = require("ethers");
const create_1 = require("@polkadot/types/create");
const util_crypto_1 = require("@polkadot/util-crypto");
const registry = new create_1.TypeRegistry();
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
const createERCDepositData = (tokenAmount, recipientAddress, parachainId) => {
    let recipientAddressInBytes;
    if (ethers_1.utils.isAddress(recipientAddress)) {
        recipientAddressInBytes = (0, exports.getEVMRecipientAddressInBytes)(recipientAddress);
    }
    else {
        recipientAddressInBytes = (0, exports.getSubstrateRecipientAddressInBytes)(recipientAddress, parachainId);
    }
    const depositDataBytes = constructMainDepositData(ethers_1.BigNumber.from(tokenAmount), recipientAddressInBytes);
    const depositData = ethers_1.utils.hexlify(depositDataBytes);
    return depositData;
};
exports.createERCDepositData = createERCDepositData;
/**
 * Constructs the main deposit data for a given token and recipient.
 *
 * @category Helpers
 * @param {BigNumber} tokenStats - The amount of ERC20 tokens or the token ID of ERC721 tokens.
 * @param {Uint8Array} destRecipient - The recipient address in bytes array
 * @returns {Uint8Array} The main deposit data in bytes array
 */
const constructMainDepositData = (tokenStats, destRecipient) => {
    const data = ethers_1.utils.concat([
        ethers_1.utils.hexZeroPad(tokenStats.toHexString(), 32),
        ethers_1.utils.hexZeroPad(ethers_1.BigNumber.from(destRecipient.length).toHexString(), 32),
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
const createPermissionedGenericDepositData = (hexMetaData) => {
    const hexMetaDataLength = hexMetaData.substr(2).length / 2;
    return '0x' + (0, exports.toHex)(hexMetaDataLength, 32).substr(2) + hexMetaData.substr(2);
};
exports.createPermissionedGenericDepositData = createPermissionedGenericDepositData;
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
const createPermissionlessGenericDepositData = (executeFunctionSignature, executeContractAddress, maxFee, depositor, executionData) => {
    return ('0x' +
        (0, exports.toHex)(maxFee, 32).substr(2) + // uint256
        (0, exports.toHex)(executeFunctionSignature.substr(2).length / 2, 2).substr(2) + // uint16
        executeFunctionSignature.substr(2) + // bytes
        (0, exports.toHex)(executeContractAddress.substr(2).length / 2, 1).substr(2) + // uint8
        executeContractAddress.substr(2) + // bytes
        (0, exports.toHex)(depositor.substr(2).length / 2, 1).substr(2) + // uint8
        depositor.substr(2) +
        executionData.substr(2)) // bytes
        .toLowerCase();
};
exports.createPermissionlessGenericDepositData = createPermissionlessGenericDepositData;
/**
 * Converts a Substrate recipient address to a JSON multilocation.
 *
 * @param {string} recipientAddress - The recipient address as a string.
 * @returns {string} The recipient address as a stringified Substrate Multilocation Object
 */
const constructSubstrateRecipient = (recipientAddress, parachainId) => {
    const addressPublicKeyBytes = (0, util_crypto_1.decodeAddress)(recipientAddress);
    const addressPublicKeyHexString = ethers_1.utils.hexlify(addressPublicKeyBytes);
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
exports.constructSubstrateRecipient = constructSubstrateRecipient;
/**
 * Converts a EVM recipient address to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string.
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
const getEVMRecipientAddressInBytes = (recipientAddress) => {
    return ethers_1.utils.arrayify(recipientAddress);
};
exports.getEVMRecipientAddressInBytes = getEVMRecipientAddressInBytes;
/**
 * Converts a Substrate recipient multilocation to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
const getSubstrateRecipientAddressInBytes = (recipientAddress, parachainId) => {
    const result = registry
        .createType('MultiLocation', JSON.parse((0, exports.constructSubstrateRecipient)(recipientAddress, parachainId)))
        .toU8a();
    return result;
};
exports.getSubstrateRecipientAddressInBytes = getSubstrateRecipientAddressInBytes;
/**
 * Return hex data padded to the number defined as padding
 * based on ethers.utils.hexZeroPad
 *
 * @category Helpers
 * @param covertThis - data to convert
 * @param padding - number to padd the data
 * @returns {string}
 */
const toHex = (covertThis, padding) => {
    const amount = covertThis instanceof ethers_1.BigNumber ? covertThis : ethers_1.BigNumber.from(covertThis);
    return ethers_1.utils.hexZeroPad(ethers_1.utils.hexlify(amount), padding);
};
exports.toHex = toHex;
//# sourceMappingURL=helpers.js.map