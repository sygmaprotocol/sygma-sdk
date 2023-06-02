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
 * @returns {string} The deposit data as hex string
 */
export const createERCDepositData = (tokenAmount: string, recipientAddress: string): string => {
  const recipientAddressInBytes = getRecipientAddressInBytes(recipientAddress);
  const depositDataBytes = constructMainDepositData(
    BigNumber.from(tokenAmount),
    recipientAddressInBytes,
  );
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
const constructMainDepositData = (tokenStats: BigNumber, destRecipient: Uint8Array): Uint8Array => {
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
 * Converts a Substrate recipient address to a JSON multilocation.
 *
 * @param {string} recipientAddress - The recipient address as a string.
 * @returns {string} The recipient address as a stringified Substrate Multilocation Object
 */
export const constructSubstrateRecipient = (recipientAddress: string): string => {
  const addressPublicKeyBytes = decodeAddress(recipientAddress);
  const addressPublicKeyHexString = utils.hexlify(addressPublicKeyBytes);
  const substrateMultilocation = JSON.stringify({
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

  return substrateMultilocation;
};

/**
 * Converts a recipient address to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string. If the address passed in is not an Ethereum address, a Substrate Multilocation object will be constructed and serialized.
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
export const getRecipientAddressInBytes = (recipientAddress: string): Uint8Array => {
  if (utils.isAddress(recipientAddress)) {
    // EVM address
    return utils.arrayify(recipientAddress);
  }

  const result = registry
    .createType('MultiLocation', JSON.parse(constructSubstrateRecipient(recipientAddress)))
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
export const toHex = (covertThis: string | number | BigNumber, padding: number): string => {
  const amount = covertThis instanceof BigNumber ? covertThis : BigNumber.from(covertThis);
  return utils.hexZeroPad(utils.hexlify(amount), padding);
};
