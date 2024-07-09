import type {
  Domainlike,
  Eip1193Provider,
  EthereumConfig,
  EvmResource,
} from '@buildwithsygma/core';
import { Config, Network, ResourceType } from '@buildwithsygma/core';
import { Bridge__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { constants, ethers } from 'ethers';

import { BaseTransfer } from './baseTransfer.js';
import { getFeeInformation } from './fee/getFeeInformation.js';
import type { TransactionRequest } from './types.js';
import { genericMessageTransfer } from './utils/index.js';
import { createTransactionRequest } from './utils/transaction.js';
import { createPermissionlessGenericDepositData } from './utils/helpers.js';
/**
 * Required parameters for initiating
 * a generic message transfer request
 */
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
/**
 * Creates a cross chain contract
 * call object
 * @param {GenericMessageTransferRequest<ContractAbi, FunctionName>} request
 * @returns {Promise<GenericMessageTransfer<ContractAbi, FunctionName>>}
 */
export async function createCrossChainContractCall<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
>(
  request: GenericMessageTransferRequest<ContractAbi, FunctionName>,
): Promise<GenericMessageTransfer<ContractAbi, FunctionName>> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);
  const genericTransfer = new GenericMessageTransfer<ContractAbi, FunctionName>(request, config);

  const isValidTransfer = await genericTransfer.isValidTransfer();
  if (!isValidTransfer) throw new Error('Invalid transfer.');

  return genericTransfer;
}
/**
 * GenericMessageTransfer contains
 * functionality that facilitates generic
 * transfers or contract calls between two
 * EVM chains (for now)
 */
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
  /**
   * Create a GenericMessageTransfer object
   * @param {GenericMessageTransferRequest<ContractAbi, FunctionName>} params
   * @param {Config} config
   */
  constructor(params: GenericMessageTransferRequest<ContractAbi, FunctionName>, config: Config) {
    super(params, config);
    this.destinationContractAddress = params.destinationContractAddress;
    this.gasLimit = params.gasLimit;
    this.functionParameters = params.functionParameters;
    this.functionName = params.functionName;
    this.destinationContractAbi = params.destinationContractAbi;
    this.maxFee = params.maxFee;
  }
  /**
   * Checks whether the transfer is valid
   * given all parameters
   * @returns {Promise<boolean>}
   */
  async isValidTransfer(): Promise<boolean> {
    // Resource type should always be generic
    if (
      this.resource.type !== ResourceType.PERMISSIONED_GENERIC &&
      this.resource.type !== ResourceType.PERMISSIONLESS_GENERIC
    ) {
      return false;
    }
    // Destination domain for a generic
    // transfer is only EVM supported for now
    // from EVM
    const destinationDomain = this.config.getDomainConfig(this.destination) as EthereumConfig;
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

    return feeInformation.feeHandlerAddress !== constants.AddressZero;
  }
  /**
   * Sets the destination contract address
   * Target contract address
   * @param {string} contractAddress
   */
  setDestinationContractAddress(contractAddress: string): void {
    this.destinationContractAddress = contractAddress;
  }
  /**
   * Sets the destination contract ABI
   * @param {ContractAbi} contractAbi
   */
  setDestinationContractAbi(contractAbi: ContractAbi): void {
    this.destinationContractAbi = contractAbi;
  }
  /**
   * Sets the execution function name
   * @param {FunctionName} name
   */
  setExecutionFunctionName(name: FunctionName): void {
    this.functionName = name;
  }
  /**
   * Set functions arguments
   * @param {AbiParametersToPrimitiveTypes<ExtractAbiFunction<ContractAbi, FunctionName>['inputs'], 'inputs'>} parameters
   */
  setFunctionExecutionParameters(
    parameters: AbiParametersToPrimitiveTypes<
      ExtractAbiFunction<ContractAbi, FunctionName>['inputs'],
      'inputs'
    >,
  ): void {
    this.functionParameters = parameters;
  }
  /**
   * Prepare function call encodings
   * @returns {{ executionData: string; executionFunctionSignature: string; }}
   */
  private prepareFunctionCallEncodings(): {
    executionData: string;
    executeFunctionSignature: string;
  } {
    const contractInterface = new ethers.utils.Interface(
      JSON.stringify(this.destinationContractAbi),
    );

    const functionName = Object.keys(contractInterface.functions).find(functionName => {
      const withoutParamTypes = functionName.split('(');
      const name = withoutParamTypes[0].toLowerCase();
      return name === this.functionName.toLowerCase();
    });

    if (!functionName) throw new Error('Unable to find Function.');

    const executionData = contractInterface._encodeParams(
      contractInterface.functions[functionName].inputs,
      this.functionParameters as unknown[],
    );

    const executeFunctionSignature = contractInterface.getSighash(this.functionName);
    return { executionData, executeFunctionSignature };
  }
  /**
   * Creates the transaction that can be
   * sent to blockchain node
   * @param {ethers.Overrides} overrides
   * @returns {Promise<TransactionRequest>}
   */
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

  protected getDepositData(): string {
    const { executeFunctionSignature, executionData } = this.prepareFunctionCallEncodings();
    return createPermissionlessGenericDepositData(
      executeFunctionSignature,
      this.destinationContractAddress,
      this.maxFee.toString(),
      this.sourceAddress,
      executionData,
    );
  }
}
