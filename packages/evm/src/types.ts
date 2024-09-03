import type {
  Domain,
  Eip1193Provider,
  EvmResource,
  FeeHandlerType,
  SecurityModel,
} from '@buildwithsygma/core';

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
  /** Percentage - applicable when
   *  percentage calculation is used
   */
  percentage?: number;
  /** minimum Fee - applicable when
   * percentage calculation is used
   */
  minFee?: bigint;
  /** maximum Fee - applicable when
   * percentage calculation is used
   */
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
