import type { Domainlike, Eip1193Provider, EvmResource } from '@buildwithsygma/core';
import { Config, Network, ResourceType } from '@buildwithsygma/core';
import { Bridge__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
// import type { BaseTransferParams } from 'base-transfer';
import { constants, ethers } from 'ethers';

import { BaseTransfer } from './baseTransfer.js';
import { getFeeInformation } from './fee/getFeeInformation.js';
import type { TransactionRequest } from './types.js';
import { genericMessageTransfer } from './utils/index.js';
import { createTransactionRequest } from './utils/transaction.js';

export interface GenericMessageTransferRequest<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
> {
  // TODO: investigate why "extends BaseTransferParams" is not working
  source: Domainlike;
  destination: Domainlike;
  sourceNetworkProvider: Eip1193Provider;
  sourceAddress: string;
  resource: string | EvmResource;

  gasLimit: bigint;
  functionParameters: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<ContractAbi, FunctionName>['inputs'],
    'inputs'
  >;
  functionName: FunctionName;
  destinationContractAbi: ContractAbi;
  destinationContractAddress: string;
  maxFee: bigint;
}

export async function createCrossChainContractCall<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
>(
  request: GenericMessageTransferRequest<ContractAbi, FunctionName>,
): Promise<GenericMessageTransfer<ContractAbi, FunctionName>> {
  const config = new Config();
  const genericTransfer = new GenericMessageTransfer<ContractAbi, FunctionName>(request, config);

  const isValidTransfer = await genericTransfer.isValidTransfer();
  if (!isValidTransfer) throw new Error('Invalid transfer.');

  return genericTransfer;
}

class GenericMessageTransfer<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
> extends BaseTransfer {
  maxFee: bigint;
  destinationContractAddress: string;
  gasLimit: bigint;
  functionName: FunctionName;
  destinationContractAbi: ContractAbi;
  functionParameters: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<ContractAbi, FunctionName>['inputs'],
    'inputs'
  >;

  constructor(params: GenericMessageTransferRequest<ContractAbi, FunctionName>, config: Config) {
    super(params, config);
    this.destinationContractAddress = params.destinationContractAddress;
    this.gasLimit = params.gasLimit;
    this.functionParameters = params.functionParameters;
    this.functionName = params.functionName;
    this.destinationContractAbi = params.destinationContractAbi;
    this.maxFee = params.maxFee;
  }

  async isValidTransfer(): Promise<boolean> {
    // Resource type should always be generic
    if (this.resource.type !== ResourceType.PERMISSIONED_GENERIC) {
      return false;
    }

    // Destination domain for a generic
    // transfer is only EVM supported for now
    // from EVM
    const destinationDomain = this.config.getDomainConfig(this.destination);
    if (destinationDomain.type !== Network.EVM) {
      return false;
    }

    // see if fee handler is registered
    // otherwise its not a valid
    // route
    const web3Provider = new Web3Provider(this.sourceNetworkProvider);
    const sourceDomain = this.config.getDomainConfig(this.source);
    const feeInformation = await getFeeInformation(
      this.config,
      web3Provider,
      sourceDomain.id,
      destinationDomain.id,
      this.resource.resourceId,
    );

    if (feeInformation.feeHandlerAddress === constants.AddressZero) {
      return false;
    }

    return true;
  }

  setDestinationContractAddress(contractAddress: string): void {
    this.destinationContractAddress = contractAddress;
  }

  setDestinationContractAbi(contractAbi: ContractAbi): void {
    this.destinationContractAbi = contractAbi;
  }

  setExecutionFunctionName(name: FunctionName): void {
    this.functionName = name;
  }

  setFunctionExecutionParameters(
    parameters: AbiParametersToPrimitiveTypes<
      ExtractAbiFunction<ContractAbi, FunctionName>['inputs'],
      'inputs'
    >,
  ): void {
    this.functionParameters = parameters;
  }

  private prepareFunctionCallEncodings(): {
    executionData: string;
    executeFunctionSignature: string;
  } {
    const contractInterface = new ethers.utils.Interface(
      JSON.stringify(this.destinationContractAbi),
    );
    const executionData = contractInterface.encodeFunctionData(
      this.functionName,
      this.functionParameters,
    );
    const executeFunctionSignature = contractInterface.getSighash(this.functionName);
    return { executionData, executeFunctionSignature };
  }

  async buildTransaction(overrides?: ethers.Overrides): Promise<TransactionRequest> {
    const isValid = await this.isValidTransfer();
    if (!isValid) throw new Error('Invalid Transfer.');

    const { executeFunctionSignature, executionData } = this.prepareFunctionCallEncodings();
    const { resourceId } = this.resource;

    const executeContractAddress = this.destinationContractAddress;
    const sourceDomain = this.config.getDomainConfig(this.source);
    const domainId = this.config.getDomainConfig(this.destination).id.toString();
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const depositor = this.sourceAddress;
    const maxFee = this.maxFee.toString();
    const bridgeInstance = Bridge__factory.connect(sourceDomain.bridge, provider);
    const feeData = await this.getFee();

    const transaction = await genericMessageTransfer({
      executeFunctionSignature,
      executeContractAddress,
      maxFee,
      depositor,
      executionData,
      bridgeInstance,
      domainId,
      resourceId,
      feeData,
      overrides,
    });

    return createTransactionRequest(transaction);
  }
}
