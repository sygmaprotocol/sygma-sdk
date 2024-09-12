import type { EvmResource } from '@buildwithsygma/core';
import { Config, FeeHandlerType, ResourceType, SecurityModel } from '@buildwithsygma/core';
import { Bridge__factory, ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, constants, ethers, type PopulatedTransaction, utils } from 'ethers';

import { AssetTransfer } from './evmAssetTransfer.js';
import type {
  EvmFee,
  FungibleTransferOptionalMessage,
  FungibleTransferParams,
  TransactionRequest,
} from './types.js';
import { approve, getERC20Allowance } from './utils/approveAndCheckFns.js';
import { createFungibleDepositData } from './utils/assetTransferHelpers.js';
import { createTransactionRequest } from './utils/transaction.js';

/**
 * @internal
 * @class EvmFungibleAssetTransfer
 *
 * Class that encapsulates logic
 * for transferring fungible tokens
 * using Sygma protocol
 */
class FungibleAssetTransfer extends AssetTransfer {
  /**
   * @privateRemarks
   *
   * will be used in future
   */
  protected securityModel: SecurityModel;
  /**
   * @privateRemarks
   *
   * adjustedAmount is the amount that will
   * be deducted from the users wallet
   * specifiedAmount is the amount that the
   * user wants to transfer
   */
  protected declare adjustedAmount: bigint;
  protected specifiedAmount: bigint;

  protected optionalGas?: bigint;
  protected optionalMessage?: FungibleTransferOptionalMessage;

  /**
   * Returns amount to be transferred considering the fee
   */
  get transferAmount(): bigint {
    return this.adjustedAmount;
  }

  constructor(transfer: FungibleTransferParams, config: Config) {
    super(transfer, config);
    this.specifiedAmount = transfer.amount;
    this.securityModel = transfer.securityModel ?? SecurityModel.MPC;
    this.optionalGas = transfer.optionalGas;
    this.optionalMessage = transfer.optionalMessage;
  }

  /**
   * Returns encoded deposit
   * data
   * @returns {string}
   */
  protected getDepositData(): string {
    return createFungibleDepositData({
      destination: this.destination,
      recipientAddress: this.recipientAddress,
      amount: this.adjustedAmount,
      optionalGas: this.optionalGas,
      optionalMessage: this.optionalMessage,
    });
  }

  /**
   * Checks the source wallet
   * balance to see if transfer
   * would fail
   * @param {EvmFee} fee
   * @returns {Promise<boolean>}
   */
  protected async hasEnoughBalance(fee?: EvmFee): Promise<boolean> {
    const resource = this.resource as EvmResource;
    const provider = new Web3Provider(this.sourceNetworkProvider);

    if (fee) {
      switch (fee.type) {
        case FeeHandlerType.BASIC:
        case FeeHandlerType.TWAP: {
          const nativeBalance = await provider.getBalance(this.sourceAddress);
          return nativeBalance.gt(fee.fee);
        }
        case FeeHandlerType.PERCENTAGE: {
          const erc20 = ERC20__factory.connect(resource.address, provider);
          const erc20TokenBalance = await erc20.balanceOf(this.sourceAddress);
          return erc20TokenBalance.gt(fee.fee);
        }
      }
    }

    return false;
  }

  /**
   * Set amount to be transferred
   * @param {BigInt} amount
   * @returns {Promise<void>}
   */
  public async setTransferAmount(amount: bigint): Promise<void> {
    this.specifiedAmount = amount;
    const fee = await this.getFee();
    this.adjustedAmount = calculateAdjustedAmount(this.specifiedAmount, fee);
  }

  public setResource(resource: EvmResource): void {
    if (resource.type !== ResourceType.FUNGIBLE) {
      throw new Error('Unsupported Resource type.');
    }
    this.transferResource = resource;
  }

  /**
   * Get array of approval transactions
   * associated with fungible transfer
   * @returns {Promise<Array<TransactionRequest>>}
   */
  public async getApprovalTransactions(
    overrides?: ethers.Overrides,
  ): Promise<Array<TransactionRequest>> {
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.resourceId);
    const resource = this.resource as EvmResource;

    const erc20 = ERC20__factory.connect(resource.address, provider);
    const fee = await this.getFee();

    const hasBalance = await this.hasEnoughBalance(fee);
    if (!hasBalance) throw new Error('Insufficient balance');

    const feeHandlerAllowance = await getERC20Allowance(
      erc20,
      this.sourceAddress,
      fee.handlerAddress,
    );
    const handlerAllowance = await getERC20Allowance(erc20, this.sourceAddress, handlerAddress);

    const approvals: Array<PopulatedTransaction> = [];
    if (fee.type == FeeHandlerType.PERCENTAGE && feeHandlerAllowance.lt(fee.fee)) {
      const approvalAmount = BigNumber.from(fee.fee).toString();
      approvals.push(await approve(erc20, fee.handlerAddress, approvalAmount, overrides));
    }

    const transferAmount = BigNumber.from(this.adjustedAmount);
    if (handlerAllowance.lt(transferAmount)) {
      const approvalAmount = BigNumber.from(transferAmount).toString();
      approvals.push(await approve(erc20, handlerAddress, approvalAmount, overrides));
    }

    return approvals.map(approval => createTransactionRequest(approval));
  }
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
export async function createFungibleAssetTransfer(
  params: FungibleTransferParams,
): Promise<FungibleAssetTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);

  const transfer = new FungibleAssetTransfer(params, config);

  const isValid = await transfer.isValidTransfer();
  if (!isValid)
    throw new Error('Handler not registered, please check if this is a valid bridge route.');

  await transfer.setTransferAmount(params.amount);
  return transfer;
}
