import type { ParachainId } from '@buildwithsygma/core';
import { Network } from '@buildwithsygma/core';
import type { NativeTokenAdapter } from '@buildwithsygma/sygma-contracts';
import { hexlify } from '@ethersproject/bytes';
import type { ethers } from 'ethers';

import type {
  FungibleTransferOptionalMessage,
  NativeTokenDepositArgsWithEVMMessage,
  NativeTokenDepositArgsWithGeneralMessage,
  NativeTokenDepositArgsWithoutMessage,
  NativeTokenDepositMethods,
  TransactionRequest,
} from '../types.js';

import { serializeDestinationAddress, encodeOptionalMessage } from './assetTransferHelpers.js';
import { createTransactionRequest } from './transaction.js';

export function getNativeTokenDepositMethod(
  destinationNetworkType: Network,
  optionalMessage?: FungibleTransferOptionalMessage,
): NativeTokenDepositMethods {
  if (!optionalMessage) {
    if (destinationNetworkType === Network.EVM) {
      return 'depositToEVM';
    }
    return 'deposit';
  } else {
    if (destinationNetworkType === Network.EVM) {
      return 'depositToEVMWithMessage';
    }
  }

  throw new Error('Unsupported deposit method.');
}

interface NativeDepositParams {
  method: NativeTokenDepositMethods;
  recipientAddress: string;
  destinationNetworkType: Network;
  destinationNetworkId: string;
  parachainId?: ParachainId;
  optionalMessage?: FungibleTransferOptionalMessage;
  optionalGas?: bigint;
  depositData: string;
}

export function getNativeTokenDepositContractArgs(
  args: NativeDepositParams,
):
  | NativeTokenDepositArgsWithoutMessage
  | NativeTokenDepositArgsWithEVMMessage
  | NativeTokenDepositArgsWithGeneralMessage {
  const {
    method,
    destinationNetworkId,
    recipientAddress,
    destinationNetworkType,
    parachainId,
    optionalMessage,
    optionalGas,
    depositData,
  } = args;

  switch (method) {
    case 'deposit':
    case 'depositToEVM':
      return [
        destinationNetworkId,
        hexlify(serializeDestinationAddress(recipientAddress, destinationNetworkType, parachainId)),
      ];
    case 'depositToEVMWithMessage':
      return [
        destinationNetworkId,
        recipientAddress,
        optionalGas!,
        encodeOptionalMessage(optionalMessage!),
      ];
    case 'depositGeneral':
      return [destinationNetworkId, `0x${depositData.substring(66)}`];
  }
}

export async function getNativeTokenDepositTransaction(
  depositParams: Omit<NativeDepositParams, 'method'>,
  nativeTokenAdapter: NativeTokenAdapter,
  overrides?: ethers.PayableOverrides,
): Promise<TransactionRequest> {
  const method = getNativeTokenDepositMethod(
    depositParams.destinationNetworkType,
    depositParams.optionalMessage,
  );

  const args = getNativeTokenDepositContractArgs({
    method,
    ...depositParams,
  });

  switch (method) {
    case 'deposit':
    case 'depositToEVM':
      return createTransactionRequest(
        await nativeTokenAdapter.populateTransaction[method](
          ...(args as NativeTokenDepositArgsWithoutMessage),
          overrides,
        ),
      );
    case 'depositToEVMWithMessage':
      return createTransactionRequest(
        await nativeTokenAdapter.populateTransaction[method](
          ...(args as NativeTokenDepositArgsWithEVMMessage),
          overrides,
        ),
      );
    case 'depositGeneral':
      return createTransactionRequest(
        await nativeTokenAdapter.populateTransaction[method](
          ...(args as NativeTokenDepositArgsWithGeneralMessage),
          overrides,
        ),
      );
    default:
      throw new Error('Unsupported method');
  }
}
