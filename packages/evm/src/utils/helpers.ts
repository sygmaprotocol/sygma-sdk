import { TypeRegistry } from '@polkadot/types/create';
import { decodeAddress } from '@polkadot/util-crypto';
import { utils, BigNumber } from 'ethers';
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
 * @param {bigint} tokenAmount - The amount of tokens to be transferred.
 * @param {string} recipientAddress - The address of the recipient.
 * @param {number} parachainId - Optional parachain id if the substrate destination targets another parachain.
 * @returns {string} The deposit data as hex string
 */
export const createERCDepositData = (
  tokenAmount: bigint,
  recipientAddress: string,
  parachainId?: number,
): string => {
  let recipientAddressInBytes;
  if (utils.isAddress(recipientAddress)) {
    recipientAddressInBytes = getEVMRecipientAddressInBytes(recipientAddress);
  } else if (parachainId) {
    recipientAddressInBytes = getSubstrateRecipientAddressInBytes(recipientAddress, parachainId);
  } else {
    const hexAddress = addressToHex(recipientAddress, recipientAddress.length);
    recipientAddressInBytes = utils.arrayify(`0x${hexAddress}`);
  }

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
 * Converts a Substrate recipient address to a JSON multilocation.
 *
 * @param {string} recipientAddress - The recipient address as a string.
 * @returns {string} The recipient address as a stringified Substrate Multilocation Object
 */
export const constructSubstrateRecipient = (
  recipientAddress: string,
  parachainId?: number,
): string => {
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
export const getEVMRecipientAddressInBytes = (recipientAddress: string): Uint8Array => {
  return utils.arrayify(recipientAddress);
};
/**
 * Converts a Substrate recipient multilocation to a Uint8Array of bytes.
 *
 * @param {string} recipientAddress - The recipient address, as a string
 * @returns {Uint8Array} The recipient address as a Uint8Array of bytes
 */
export const getSubstrateRecipientAddressInBytes = (
  recipientAddress: string,
  parachainId?: number,
): Uint8Array => {
  const registry = new TypeRegistry();
  const result = registry
    .createType(
      'MultiLocation',
      JSON.parse(constructSubstrateRecipient(recipientAddress, parachainId)),
    )
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
export const toHex = (
  covertThis: string | number | BigNumber | bigint,
  padding: number,
): string => {
  const amount = covertThis instanceof BigNumber ? covertThis : BigNumber.from(covertThis);
  return utils.hexZeroPad(utils.hexlify(amount), padding);
};
/**
 * JS types to 0x Hex string
 * required to initiate contract
 * calls on destination EVM chain
 * @param {string | BigNumber | number | boolean | bigint} param
 * @returns {`0x{string}`}
 */
function createGenericCallParameter(param: string | BigNumber | number | boolean | bigint): string {
  const DEFAULT_PADDING = 32;
  switch (typeof param) {
    case 'boolean':
      return toHex(Number(param), DEFAULT_PADDING).substring(2);
    case 'bigint':
    case 'number':
    case 'string':
      return toHex(param, DEFAULT_PADDING).substring(2);
    case 'object':
      if (param instanceof BigNumber) {
        return toHex(param, DEFAULT_PADDING).substring(2);
      }
      throw new Error('Unsupported parameter type.');
    case 'symbol':
    case 'undefined':
    case 'function':
      throw new Error('Unsupported parameter type.');
  }
}
/**
 * Convert JS primitive types to hex encoded
 * strings for EVM function calls
 * @param {Array<string | BigNumber | number | boolean | bigint>} params
 * @returns {string}
 */
export function serializeGenericCallParameters(
  params: Array<string | BigNumber | number | boolean | bigint>,
): string {
  /**
   * .slice(1) is used because first parameter will always be an
   * address by default, and this parameter is not specified by
   * the user, relayers add it so this param is discarded by SDK
   * However, this param should still be part of ABI otherwise
   * messages won't be passed correctly
   */
  const serialized = params
    .slice(1)
    .map(item => createGenericCallParameter(item))
    .join('');
  return `0x${serialized}`;
}

/**
 * Return the address transformed to hex for bitcoin deposits
 *
 * @category Helpers
 * @param address  - bitcoin address
 * @param addressLength - length of the address
 * @returns {string}
 */
export const addressToHex = (address: string, addressLength: number): string => {
  const hexData = new Array(addressLength);
  for (let i = 0; i < hexData.length; i++) {
    const codePoint = address.charCodeAt(i);
    hexData[i] = codePoint.toString(16);
  }

  return hexData.join('');
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
    toHex(maxFee, 32).substring(2) + // uint256
    toHex(executeFunctionSignature.substring(2).length / 2, 2).substring(2) + // uint16
    executeFunctionSignature.substring(2) + // bytes
    toHex(executeContractAddress.substring(2).length / 2, 1).substring(2) + // uint8
    executeContractAddress.substring(2) + // bytes
    toHex(depositor.substring(2).length / 2, 1).substring(2) + // uint8
    depositor.substring(2) +
    executionData.substring(2)
  ) // bytes
    .toLowerCase();
};
