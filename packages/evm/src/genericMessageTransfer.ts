import type { EthereumConfig } from '@buildwithsygma/core';
import { Config, Network, ResourceType } from '@buildwithsygma/core';
import { Bridge__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import type { ethers } from 'ethers';
import { constants } from 'ethers';

import { EvmTransfer } from './evmTransfer.js';
import { getFeeInformation } from './fee/getFeeInformation.js';
import type { GenericMessageTransferParams, TransactionRequest } from './types.js';
import { createGenericCallDepositData } from './utils/genericTransferHelpers.js';
import { executeDeposit } from './utils/index.js';
import { createTransactionRequest } from './utils/transaction.js';

/**
 * @internal
 * @class EvmFungibleAssetTransfer
 *
 * Class that encapsulates logic
 * for transferring generic messages
 * using Sygma protocol
 */
class GenericMessageTransfer<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
> extends EvmTransfer {
  protected maxFee: bigint;
  protected destinationContractAddress: string;
  protected gasLimit: bigint;
  functionName: FunctionName;
  destinationContractAbi: ContractAbi;
  functionParameters: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<ContractAbi, FunctionName>['inputs'],
    'inputs'
  >;

  /**
   * Create `GenericMessageTransfer` instance
   * @param {GenericMessageTransferRequest<ContractAbi, FunctionName>} params
   * @param {Config} config
   */
  constructor(params: GenericMessageTransferParams<ContractAbi, FunctionName>, config: Config) {
    super(params, config);
    this.destinationContractAddress = params.destinationContractAddress;
    this.gasLimit = params.gasLimit;
    this.functionParameters = params.functionParameters;
    this.functionName = params.functionName;
    this.destinationContractAbi = params.destinationContractAbi;
    this.maxFee = params.maxFee;
  }

  /**
   * Checks validity of the transfer
   * @returns {Promise<boolean>}
   */
  public async isValidTransfer(): Promise<boolean> {
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
  public setDestinationContractAddress(contractAddress: string): void {
    this.destinationContractAddress = contractAddress;
  }

  /**
   * Sets the destination contract ABI
   * @param {ContractAbi} contractAbi
   */
  public setDestinationContractAbi(contractAbi: ContractAbi): void {
    this.destinationContractAbi = contractAbi;
  }

  /**
   * Sets the execution function name
   * @param {FunctionName} name
   */
  public setExecutionFunctionName(name: FunctionName): void {
    this.functionName = name;
  }

  /**
   * Set functions arguments
   * @param {AbiParametersToPrimitiveTypes<ExtractAbiFunction<ContractAbi, FunctionName>['inputs'], 'inputs'>} parameters
   */
  public setFunctionExecutionParameters(
    parameters: AbiParametersToPrimitiveTypes<
      ExtractAbiFunction<ContractAbi, FunctionName>['inputs'],
      'inputs'
    >,
  ): void {
    this.functionParameters = parameters;
  }
  /**
   * Get the cross chain generic message transfer
   * transaction
   * @param {ethers.Overrides} overrides
   * @returns {Promise<TransactionRequest>}
   */
  async getTransferTransaction(overrides?: ethers.Overrides): Promise<TransactionRequest> {
    const isValid = await this.isValidTransfer();
    if (!isValid) throw new Error('Invalid Transfer.');

    const sourceDomain = this.config.getDomainConfig(this.source);
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const bridgeInstance = Bridge__factory.connect(sourceDomain.bridge, provider);
    const feeData = await this.getFee();
    const depositData = this.getDepositData();

    const transaction = await executeDeposit(
      this.destination.id.toString(),
      this.resource.resourceId,
      depositData,
      feeData,
      bridgeInstance,
      overrides,
    );

    return createTransactionRequest(transaction);
  }
  /**
   * Get prepared additional deposit data
   * in hex string format
   * @returns {string}
   */
  protected getDepositData(): string {
    return createGenericCallDepositData({
      abi: this.destinationContractAbi,
      functionName: this.functionName,
      functionParams: this.functionParameters,
      contractAddress: this.destinationContractAddress,
      destination: this.destination,
      maxFee: this.maxFee,
      depositor: this.sourceAddress as `0x${string}`,
    });
  }
}

/**
 * Prepare a Sygma cross chain contract call
 * @param {GenericMessageTransferRequest<ContractAbi, FunctionName>} request
 * @returns {Promise<GenericMessageTransfer<ContractAbi, FunctionName>>}
 */
export async function createCrossChainContractCall<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
>(
  params: GenericMessageTransferParams<ContractAbi, FunctionName>,
): Promise<GenericMessageTransfer<ContractAbi, FunctionName>> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);
  const genericTransfer = new GenericMessageTransfer<ContractAbi, FunctionName>(params, config);

  const isValidTransfer = await genericTransfer.isValidTransfer();
  if (!isValidTransfer) throw new Error('Invalid transfer.');

  return genericTransfer;
}
