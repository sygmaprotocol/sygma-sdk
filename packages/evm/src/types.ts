import type {
  Domain,
  Eip1193Provider,
  EvmResource,
  FeeHandlerType,
  SecurityModel,
} from '@buildwithsygma/core';
import type { Bridge } from '@buildwithsygma/sygma-contracts';
import type { ethers } from 'ethers';

export interface TransactionRequest {
  to: string;
  value: bigint;
  data: string;
  gasLimit: bigint;
}

export type EvmFee = {
  /** amount that will be deducated */
  fee: bigint;
  /** type of fee calculation that will be used */
  type: FeeHandlerType;
  /** fee handler contract address */
  handlerAddress: string;
  /** fungible token ERC20 address */
  tokenAddress?: string;
  /** Percentage - applicable when percentage calculation is used */
  percentage?: number;
  /** minimum Fee - applicable when percentage calculation is used */
  minFee?: bigint;
  /** maximum Fee - applicable when percentage calculation is used */
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

/** An EVM resource is accepted as either the resource object or it's Sygma ID */
export type EvmResourceish = string | EvmResource;

/** @internal */
export type FungibleTransferParams = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC20 token transfer, including the gas price and gas limit. */
  feeData: EvmFee;
  /** Deposit data including amount of tokens, length and recipient address */
  depositData: string;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};
