import type { Domain } from '@buildwithsygma/core';
import { Network } from '@buildwithsygma/core';
import { AbiCoder } from '@ethersproject/abi';
import { arrayify, concat, hexlify, hexZeroPad } from '@ethersproject/bytes';
import { TypeRegistry } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
import { BigNumber, utils } from 'ethers';

import type { FungibleTransferOptionalMessage } from '../types.js';

const ACTIONS_ARRAY_ABI =
  'tuple(uint256 nativeValue, address callTo, address approveTo, address tokenSend, address tokenReceive, bytes data)[]';

interface AssetDepositParams {
  destination: Domain;
  recipientAddress: string;
  amount?: bigint;
  tokenId?: string;
  optionalGas?: bigint;
  optionalMessage?: FungibleTransferOptionalMessage;
}

export function serializeEvmAddress(evmAddress: `0x${string}`): Uint8Array {
  return arrayify(evmAddress);
}

export function createSubstrateMultiLocationObject(
  substrateAddress: string,
  parachainId?: number,
): string {
  const decodedAddress = decodeAddress(substrateAddress);
  const hexlifiedAddress = hexlify(decodedAddress);
  const parents = parachainId ? 1 : 0;
  const interior = parachainId
    ? {
        X2: [
          {
            parachain: parachainId,
          },
          {
            AccountId32: {
              network: { any: null },
              id: hexlifiedAddress,
            },
          },
        ],
      }
    : {
        X1: {
          AccountId32: {
            network: { any: null },
            id: hexlifiedAddress,
          },
        },
      };

  return JSON.stringify({ parents, interior });
}

export function serializeSubstrateAddress(
  substrateAddress: string,
  parachainId?: number,
): Uint8Array {
  const multilocationObject = createSubstrateMultiLocationObject(substrateAddress, parachainId);
  const registry = new TypeRegistry();
  return registry.createType('MultiLocation', JSON.parse(multilocationObject)).toU8a();
}

export function serializeDestinationAddress(
  address: string,
  type: Network,
  parachainId?: number,
): Uint8Array {
  switch (type) {
    case Network.EVM: {
      return serializeEvmAddress(address as `0x${string}`);
    }
    case Network.SUBSTRATE: {
      return serializeSubstrateAddress(address, parachainId);
    }
    case Network.BITCOIN: {
      return utils.arrayify(`${utils.hexlify(utils.toUtf8Bytes(address))}`);
    }
    default: {
      throw new Error('Unsupported destination network type.');
    }
  }
}

export function encodeOptionalMessage(optionalMessage: FungibleTransferOptionalMessage): string {
  const { transactionId, actions, receiver } = optionalMessage;
  const abiCoder = new AbiCoder();

  const optionalMessageEncoded = abiCoder.encode(
    ['bytes32', ACTIONS_ARRAY_ABI, 'address'],
    [
      transactionId,
      actions.map(action => [
        action.nativeValue,
        action.callTo,
        action.approveTo,
        action.tokenSend,
        action.tokenReceive,
        action.data,
      ]),
      receiver,
    ],
  );

  return optionalMessageEncoded;
}

export function createAssetDepositData(depositParams: AssetDepositParams): string {
  const { recipientAddress, destination, amount, tokenId, optionalGas, optionalMessage } =
    depositParams;

  const recipientAddressSerialized: Uint8Array = serializeDestinationAddress(
    recipientAddress,
    destination.type,
    destination.parachainId,
  );

  const val = amount !== undefined ? amount : tokenId !== undefined ? tokenId : null;
  if (val === null) throw new Error('Token Amount Or ID is required.');

  const HEX_PADDING = 32;
  const tokenAmountOrIdInHex = BigNumber.from(val).toHexString();
  const zeroPaddedAmount = hexZeroPad(tokenAmountOrIdInHex, HEX_PADDING);
  const addressLenInHex = BigNumber.from(recipientAddressSerialized.length).toHexString();
  const zeroPaddedAddrLen = hexZeroPad(addressLenInHex, HEX_PADDING);

  let depositData = concat([zeroPaddedAmount, zeroPaddedAddrLen, recipientAddressSerialized]);

  if (optionalMessage !== undefined && optionalGas !== undefined) {
    const optionalGasInHex = BigNumber.from(optionalGas).toHexString();
    const zeroPaddedOptionalGas = hexZeroPad(optionalGasInHex, HEX_PADDING);
    depositData = concat([depositData, zeroPaddedOptionalGas]);

    const optionalMessageEncoded = encodeOptionalMessage(optionalMessage);
    const optionalMessageSeriailzed = arrayify(optionalMessageEncoded);
    const optionalMsgLenInHex = BigNumber.from(optionalMessageSeriailzed.length).toHexString();
    const zeroPaddedOptionalMsgLen = hexZeroPad(optionalMsgLenInHex, HEX_PADDING);

    depositData = concat([depositData, zeroPaddedOptionalMsgLen, optionalMessageSeriailzed]);
  }

  return hexlify(depositData);
}
