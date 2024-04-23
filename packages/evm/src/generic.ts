/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Domain, FeeHandlerType } from "@buildwithsygma/sygma-sdk-core";
import type { SecurityModel } from "../../core/src/index.js";

interface TransactionRequest {
  to: string;
  value: bigint;
  data: string;
  gasLimit: bigint;
}

interface Eip1193Provider {
  request(request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}

type EvmFee = {
  fee: bigint;
  type: FeeHandlerType;
  handlerAddress: string;
  tokenAddress?: string;
  percentage?: number;
  minFee?: bigint;
  maxFee?: bigint;
};

type GenericTransferRequest = {
  sourceDomain: string | number | Domain;
  sourceNetworkProvider: Eip1193Provider;
  destinationDomain: string | number | Domain;
  destinationContractAddress: string;
  destinationFunctionSignature: string;
  executionData: string;
  gasLimit: bigint;
  securityModel?: SecurityModel; //defaults to MPC
};

/**
 *
 * @param sourceDomain
 * @param sourceNetworkProvider
 * @param destinationDomain
 * @param destinationContractAddress contract address on destination that will be invoked
 * @param destinationFunctionSignature first 4 bytes of the sha3 of the function name including types. Web3.js ref: https://docs.web3js.org/api/web3-eth-abi/function/encodeFunctionSignature
 * @param executionData arguments for the function that will be invoked on destination abi encoded. Web3.js ref: https://docs.web3js.org/api/web3-eth-abi/function/encodeParameters
 * @param gasLimit maximum amount of gas to be used to execute on destination. Fee depends on this. Take into account that bridge itself will use xxx amount of gas.
 */
export function createEvmGenericTransfer(
  transferRequest: GenericTransferRequest,
): Promise<EvmGenericTransfer> {
  throw new Error("Method not implemented");
}

type ContractCallTransferRequest = {
  sourceDomain: string | number | Domain;
  sourceNetworkProvider: Eip1193Provider;
  destinationDomain: string | number | Domain;
  destinationContractAddress: string;
  //find correct typing, make it generic
  destinationContractAbi: Array<unknown>;
  //type should depend on submitted abi generic
  functionName: string;
  functionParameters: Array<unknown>;
  gasLimit: bigint;
};
/**
 *
 * @param sourceDomain
 * @param sourceNetworkProvider
 * @param destinationDomain
 * @param destinationContractAddress
 * @param destinationContractAbi
 * @param functionName
 * @param functionParameters
 * @param gasLimit
 */
export function createEvmContractCallTransfer(
  transferRequest: ContractCallTransferRequest,
): Promise<EvmGenericTransfer> {
  throw new Error("Method not implemented");
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createEvmFungibleAssetTransfer`
 */
export abstract class EvmGenericTransfer {
  constructor(transfer: {
    sourceDomain: string | number | Domain;
    sourceNetworkProvider: Eip1193Provider;
    destinationDomain: string | number | Domain;
    destinationContractAddress: string;
    destinationFunctionSignature: string;
    executionData: string;
    gasLimit: bigint;
  }) {}

  setDesinationDomain(destinationDomain: string | number | Domain): this {
    throw new Error("Method not implemented");
  }
  setDestinationAddress(destinationAddress: string): this {
    throw new Error("Method not implemented");
  }

  //TODO: add setters for rest of stuff

  getFee(gasLimit?: bigint): Promise<EvmFee> {
    throw new Error("Method not implemented");
  }

  getTransferTransaction(): Promise<TransactionRequest> {
    throw new Error("Method not implemented");
  }
}
