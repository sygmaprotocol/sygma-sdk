import type { Domain, EvmResource, FeeHandlerType, SecurityModel } from '@buildwithsygma/core';
import type { Bridge } from '@buildwithsygma/sygma-contracts';
import type { ethers } from 'ethers';

export interface TransactionRequest {
  to: string;
  value: bigint;
  data: string;
  gasLimit: bigint;
}

export interface Eip1193Provider {
  request(request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}

export type EvmFee = {
  fee: bigint;
  type: FeeHandlerType;
  handlerAddress: string;
  tokenAddress?: string;
  percentage?: number;
  minFee?: bigint;
  maxFee?: bigint;
};

export type GenericTransferRequest = {
  sourceDomain: string | number | Domain;
  sourceNetworkProvider: Eip1193Provider;
  destinationDomain: string | number | Domain;
  destinationContractAddress: string;
  destinationFunctionSignature: string;
  executionData: string;
  gasLimit: bigint;
  securityModel?: SecurityModel; //defaults to MPC
};

export type EvmResourceish = string | EvmResource;

export type FungibleTransferParams = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** Identifier of the substrate destination parachain */
  parachainId?: number;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The amount of tokens to transfer */
  amount: bigint;
  /** The recipient's address to receive the tokens. */
  recipientAddress: string;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC20 token transfer, including the gas price and gas limit. */
  feeData: EvmFee;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};
