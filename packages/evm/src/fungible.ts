import type { Eip1193Provider, EthereumConfig, EvmResource } from '@buildwithsygma/core';
import {
  Config,
  FeeHandlerType,
  isValidAddressForNetwork,
  SecurityModel,
} from '@buildwithsygma/core';
import { Bridge__factory, ERC20__factory } from '@buildwithsygma/sygma-contracts';
import type { TransactionRequest } from '@ethersproject/providers';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, constants, type PopulatedTransaction, utils } from 'ethers';

import type { EvmTransferParams } from './evmTransfer.js';
import { EvmTransfer } from './evmTransfer.js';
import type { EvmFee } from './types.js';
import {
  approve,
  createTransactionRequest,
  executeDeposit,
  getERC20Allowance,
} from './utils/index.js';
import { createFungibleDepositData } from './utils/assetTransferHelpers.js';

interface EvmFungibleTransferRequest extends EvmTransferParams {
  sourceAddress: string;
  amount: bigint;
  destinationAddress: string;
  securityModel?: SecurityModel;
}

/**
 * @internal only
 * This method is used to adjust transfer amount
 * based on percentage fee calculations
 * @param transferAmount
 * @param {EvmFee} fee
 */
function calculateAdjustedAmount(transferAmount: bigint, fee: EvmFee): bigint {
  //in case of percentage fee handler, we are calculating what amount + fee will result int user inputted amount
  //in case of fixed(basic) fee handler, fee is taken from native token
  if (fee.type === FeeHandlerType.PERCENTAGE) {
    const minFee = fee.minFee!;
    const maxFee = fee.maxFee!;
    const percentage = fee.percentage!;
    const userSpecifiedAmount = BigNumber.from(transferAmount);
    let amount: bigint;
    // calculate amount
    // without fee (percentage)
    const feelessAmount = userSpecifiedAmount
      .mul(constants.WeiPerEther)
      .div(utils.parseEther(String(1 + percentage)));

    const calculatedFee = userSpecifiedAmount.sub(feelessAmount);
    amount = feelessAmount.toBigInt();

    //if calculated percentage fee is less than lower fee bound, subtract lower bound from user input. If lower bound is 0, bound is ignored
    if (calculatedFee.lt(minFee) && minFee > 0) {
      amount = transferAmount - minFee;
    }
    //if calculated percentage fee is more than upper fee bound, subtract upper bound from user input. If upper bound is 0, bound is ignored
    if (calculatedFee.gt(maxFee) && maxFee > 0) {
      amount = transferAmount - maxFee;
    }

    return amount;
  }

  return transferAmount;
}
/**
 * Prepare a Sygma fungible token transfer
 * @param {FungibleTokenTransferRequest} params
 * @returns {Promise<EvmFungibleAssetTransfer>}
 */
export async function createEvmFungibleAssetTransfer(
  params: EvmFungibleTransferRequest,
): Promise<EvmFungibleAssetTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);

  const transfer = new EvmFungibleAssetTransfer(params, config);

  const isValid = await transfer.isValidTransfer();
  if (!isValid)
    throw new Error('Handler not registered, please check if this is a valid bridge route.');

  await transfer.setAmount(params.amount);
  return transfer;
}
/**
 * @internal
 * @class EvmFungibleAssetTransfer
 *
 * Class that encapsulates logic
 * for transferring fungible tokens
 * using Sygma protocol
 */
class EvmFungibleAssetTransfer extends EvmTransfer {
  protected destinationAddress: string = '';
  protected securityModel: SecurityModel;
  protected adjustedAmount: bigint = BigInt(0);
  private specifiedAmount: bigint; // Original value to transfer without deductions

  constructor(transfer: EvmFungibleTransferRequest, config: Config) {
    super(transfer, config);
    this.specifiedAmount = transfer.amount;

    if (isValidAddressForNetwork(transfer.destinationAddress, this.destination.type))
      this.destinationAddress = transfer.destinationAddress;
    this.securityModel = transfer.securityModel ?? SecurityModel.MPC;
  }

  /**
   * Returns amount to be transferred considering the fee
   */
  get amount(): bigint {
    return this.adjustedAmount;
  }

  public getSourceNetworkProvider(): Eip1193Provider {
    return this.sourceNetworkProvider;
  }

  async isValidTransfer(): Promise<boolean> {
    const sourceDomainConfig = this.config.getDomainConfig(this.source) as EthereumConfig;
    const web3Provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, web3Provider);
    const { resourceId } = this.resource;
    const handlerAddress = await bridge._resourceIDToHandlerAddress(resourceId);
    return utils.isAddress(handlerAddress) && handlerAddress !== constants.AddressZero;
  }

  protected getDepositData(): string {
    return createFungibleDepositData({
      destination: this.destination,
      recipientAddress: this.destinationAddress,
      amount: this.amount,
    });
  }

  /**
   * Set amount to be transferred
   * @param {BigInt} amount
   * @returns {Promise<void>}
   */
  async setAmount(amount: bigint): Promise<void> {
    this.specifiedAmount = amount;

    const fee = await this.getFee();
    this.adjustedAmount = calculateAdjustedAmount(amount, fee);
  }
  /**
   * Sets the destination address
   * @param destinationAddress
   * @returns {void}
   */
  setDestinationAddress(destinationAddress: string): void {
    if (isValidAddressForNetwork(destinationAddress, this.destination.type))
      this.destinationAddress = destinationAddress;
  }
  /**
   * Get array of approval transactions
   * associated with fungible transfer
   * @returns {Promise<Array<TransactionRequest>>}
   */
  async getApprovalTransactions(): Promise<Array<TransactionRequest>> {
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.resourceId);
    const resource = this.resource as EvmResource;

    const erc20 = ERC20__factory.connect(resource.address, provider);
    const fee = await this.getFee();

    await this.verifyAccountBalance(fee);

    const feeHandlerAllowance = await getERC20Allowance(
      erc20,
      this.sourceAddress,
      fee.handlerAddress,
    );
    const handlerAllowance = await getERC20Allowance(erc20, this.sourceAddress, handlerAddress);

    const approvals: Array<PopulatedTransaction> = [];
    if (fee.type == FeeHandlerType.PERCENTAGE && feeHandlerAllowance.lt(fee.fee)) {
      const approvalAmount = BigNumber.from(fee.fee).toString();
      approvals.push(await approve(erc20, fee.handlerAddress, approvalAmount));
    }

    const transferAmount = BigNumber.from(this.amount);
    if (handlerAllowance.lt(transferAmount)) {
      const approvalAmount = BigNumber.from(transferAmount).toString();
      approvals.push(await approve(erc20, handlerAddress, approvalAmount));
    }

    return approvals.map(approval => createTransactionRequest(approval));
  }
  /**
   * Get the fungible token transfer transaction
   * @returns {Promise<TransactionRequest>}
   */
  async getTransferTransaction(): Promise<TransactionRequest> {
    const domainConfig = this.config.getDomainConfig(this.source);
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(domainConfig.bridge, provider);
    const fee = await this.getFee();

    await this.verifyAccountBalance(fee);

    const transferTx = await executeDeposit(
      this.destination.id.toString(),
      this.resource.resourceId,
      this.getDepositData(),
      fee,
      bridge,
    );

    return createTransactionRequest(transferTx);
  }

  async verifyAccountBalance(fee: EvmFee): Promise<void> {
    const resource = this.resource as EvmResource;
    const provider = new Web3Provider(this.sourceNetworkProvider);

    // Native Token Balance check
    if ([FeeHandlerType.BASIC, FeeHandlerType.TWAP].includes(fee.type)) {
      const nativeBalance = await provider.getBalance(this.sourceAddress);

      if (nativeBalance.lt(fee.fee))
        throw new Error(`Insufficient native token balance for network ${this.sourceDomain.name}`);
    }

    // ERC20 Token Balance check
    if ([FeeHandlerType.PERCENTAGE].includes(fee.type)) {
      const erc20 = ERC20__factory.connect(resource.address, provider);
      const erc20TokenBalance = await erc20.balanceOf(this.sourceAddress);

      if (erc20TokenBalance.lt(this.specifiedAmount)) {
        throw new Error(`Insufficient ERC20 token balance`);
      }
    }
  }
}
