import type { Domain } from '@buildwithsygma/core';
import { Network } from '@buildwithsygma/core';
import { AbiCoder } from '@ethersproject/abi';
import { arrayify, concat, hexlify, hexZeroPad } from '@ethersproject/bytes';
import { TypeRegistry } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
import { BigNumber } from 'ethers';

const ACTIONS_ARRAY_ABI =
  'tuple(uint256 nativeValue, address callTo, address approveTo, address tokenSend, address tokenReceive, bytes data)';

interface FungibleDepositAction {
  nativeValue: bigint;
  callTo: string;
  approveTo: string;
  tokenSend: string;
  tokenReceive: string;
  data: string;
}

interface FungbileDepositParams {
  destination: Domain;
  recipientAddress: string;
  amount: bigint;
  optionalGas?: bigint;
  optionalMessage?: {
    transactionId: string;
    actions: FungibleDepositAction[];
    receiver: string;
  };
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

export function createFungibleDepositData(depositParams: FungbileDepositParams): string {
  const { recipientAddress, destination, amount, optionalGas, optionalMessage } = depositParams;
  let recipientAddressSerialized: Uint8Array;

  switch (destination.type) {
    case Network.EVM: {
      recipientAddressSerialized = serializeEvmAddress(recipientAddress as `0x${string}`);
      break;
    }
    case Network.SUBSTRATE: {
      recipientAddressSerialized = serializeSubstrateAddress(
        recipientAddress,
        destination.parachainId,
      );
      break;
    }
    default: {
      throw new Error('Unsupported destination network type.');
    }
  }

  const HEX_PADDING = 32;
  const amountInHex = BigNumber.from(amount).toHexString();
  const zeroPaddedAmount = hexZeroPad(amountInHex, HEX_PADDING);
  const addressLenInHex = BigNumber.from(recipientAddressSerialized.length).toHexString();
  const zeroPaddedAddrLen = hexZeroPad(addressLenInHex, HEX_PADDING);
  let depositData = concat([zeroPaddedAmount, zeroPaddedAddrLen, recipientAddressSerialized]);

  if (optionalGas) {
    const optionalGasInHex = BigNumber.from(optionalGas).toHexString();
    const zeroPaddedOptionalGas = hexZeroPad(optionalGasInHex, HEX_PADDING);
    depositData = concat([depositData, zeroPaddedOptionalGas]);
  }

  if (optionalMessage) {
    const { transactionId, actions, receiver } = optionalMessage;
    const abiCoder = new AbiCoder();
    const optionalMessageEncoded = abiCoder.encode(
      ['bytes32', ACTIONS_ARRAY_ABI, 'address'],
      [transactionId, actions, receiver],
    );

    const optionalMessageSeriailzed = arrayify(optionalMessageEncoded);
    const optionalMsgLenInHex = BigNumber.from(optionalMessageSeriailzed.length).toHexString();
    const zeroPaddedOptionalMsgLen = hexZeroPad(optionalMsgLenInHex, HEX_PADDING);

    depositData = concat([depositData, zeroPaddedOptionalMsgLen, optionalMessageSeriailzed]);
  }

  return hexlify(depositData);
}