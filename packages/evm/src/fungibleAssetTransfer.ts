import type { EvmResource } from '@buildwithsygma/core';
import { Config, FeeHandlerType, SecurityModel } from '@buildwithsygma/core';
import { Bridge__factory, ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, constants, type PopulatedTransaction, utils } from 'ethers';
import type { EvmFee, FungibleTransferParams } from 'types.js';

import { AssetTransfer } from './evmAssetTransfer.js';
import type { TransactionRequest } from './types.js';
import { approve, getERC20Allowance } from './utils/approveAndCheckFns.js';
import { createERCDepositData } from './utils/helpers.js';
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
  // will be used in future
  protected securityModel: SecurityModel;
  // amount of tokens that will be transferred
  protected amount: bigint;

  // amount of tokens that will be transferred
  get transferAmount(): bigint {
    return this.amount;
  }

  constructor(transfer: FungibleTransferParams, config: Config) {
    super(transfer, config);
    this.amount = transfer.amount;
    this.securityModel = transfer.securityModel ?? SecurityModel.MPC;
  }

  /**
   * Returns encoded deposit
   * data
   * @returns {string}
   */
  protected getDepositData(): string {
    return createERCDepositData(this.amount, this.recipient, this.destination.parachainId);
  }

  /**
   * Set amount to be transferred
   * @param {BigInt} amount
   * @returns {Promise<void>}
   */
  public async setTransferAmount(amount: bigint): Promise<void> {
    this.amount = amount;
    const fee = await this.getFee();
    this.amount = calculateAdjustedAmount(this, fee);
  }

  /**
   * Get array of approval transactions
   * associated with fungible transfer
   * @returns {Promise<Array<TransactionRequest>>}
   */
  public async getApprovalTransactions(): Promise<Array<TransactionRequest>> {
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.resourceId);
    const resource = this.resource as EvmResource;

    const erc20 = ERC20__factory.connect(resource.address, provider);
    const fee = await this.getFee();
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
}

/**
 * @internal only
 * This method is used to adjust transfer amount
 * based on percentage fee calculations
 * @param {EvmFungibleAssetTransfer} transfer
 * @param {EvmFee} fee
 */
function calculateAdjustedAmount(transfer: FungibleAssetTransfer, fee: EvmFee): bigint {
  //in case of percentage fee handler, we are calculating what amount + fee will result int user inputed amount
  //in case of fixed(basic) fee handler, fee is taken from native token
  if (fee.type === FeeHandlerType.PERCENTAGE) {
    const minFee = fee.minFee!;
    const maxFee = fee.maxFee!;
    const percentage = fee.percentage!;
    const userSpecifiedAmount = BigNumber.from(transfer.transferAmount);
    let amount = transfer.transferAmount;
    // calculate amount
    // without fee (percentage)

    const feelessAmount = userSpecifiedAmount
      .mul(constants.WeiPerEther)
      .div(utils.parseEther(String(1 + percentage)));

    const calculatedFee = userSpecifiedAmount.sub(feelessAmount);
    amount = feelessAmount.toBigInt();

    //if calculated percentage fee is less than lower fee bound, substract lower bound from user input. If lower bound is 0, bound is ignored
    if (calculatedFee.lt(minFee) && minFee > 0) {
      amount = transfer.transferAmount - minFee;
    }
    //if calculated percentage fee is more than upper fee bound, substract upper bound from user input. If upper bound is 0, bound is ignored
    if (calculatedFee.gt(maxFee) && maxFee > 0) {
      amount = transfer.transferAmount - maxFee;
    }

    return amount;
  }

  return transfer.transferAmount;
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
