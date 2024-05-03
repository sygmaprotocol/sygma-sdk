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
  } else {
    recipientAddressInBytes = getSubstrateRecipientAddressInBytes(recipientAddress, parachainId);
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
export const toHex = (covertThis: string | number | BigNumber, padding: number): string => {
  const amount = covertThis instanceof BigNumber ? covertThis : BigNumber.from(covertThis);
  return utils.hexZeroPad(utils.hexlify(amount), padding);
};
