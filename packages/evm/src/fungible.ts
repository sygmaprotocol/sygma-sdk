import type { Eip1193Provider, EvmResource } from '@buildwithsygma/core';
import { SecurityModel, Config, FeeHandlerType } from '@buildwithsygma/core';
import { Bridge__factory, ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, constants, utils, type PopulatedTransaction } from 'ethers';
import type { EvmFee, TransactionRequest } from 'types.js';

import type { EvmTransferParams } from './evmTransfer.js';
import { EvmTransfer } from './evmTransfer.js';
import { approve, getERC20Allowance } from './utils/approveAndCheckFns.js';
import { erc20Transfer } from './utils/depositFns.js';
import { createERCDepositData } from './utils/helpers.js';
import { createTransactionRequest } from './utils/transaction.js';

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
 * @param {EvmFungibleAssetTransfer} transfer
 * @param {EvmFee} fee
 */
function calculateAdjustedAmount(transfer: EvmFungibleAssetTransfer, fee: EvmFee): bigint {
  //in case of percentage fee handler, we are calculating what amount + fee will result int user inputed amount
  //in case of fixed(basic) fee handler, fee is taken from native token
  if (fee.type === FeeHandlerType.PERCENTAGE) {
    const minFee = fee.minFee!;
    const maxFee = fee.maxFee!;
    const percentage = fee.percentage!;
    const userSpecifiedAmount = BigNumber.from(transfer.amount);

    let amount = transfer.amount;
    //calculate amount without fee (percentage)
    const feelessAmount = userSpecifiedAmount
      .mul(constants.WeiPerEther)
      .div(utils.parseEther(String(1 + percentage)));

    const calculatedFee = userSpecifiedAmount.sub(feelessAmount);
    amount = feelessAmount.toBigInt();

    //if calculated percentage fee is less than lower fee bound, substract lower bound from user input. If lower bound is 0, bound is ignored
    if (calculatedFee.lt(minFee) && minFee > 0) {
      amount = transfer.amount - minFee;
    }
    //if calculated percentage fee is more than upper fee bound, substract upper bound from user input. If upper bound is 0, bound is ignored
    if (calculatedFee.gt(maxFee) && maxFee > 0) {
      amount = transfer.amount - maxFee;
    }

    return amount;
  }

  return transfer.amount;
}

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
 * @dev User should not instance this directly. All the (async) checks should be done in `createEvmFungibleAssetTransfer`
 */
class EvmFungibleAssetTransfer extends EvmTransfer {
  protected destinationAddress: string;
  protected securityModel: SecurityModel;
  protected _amount: bigint;

  get amount(): bigint {
    return this._amount;
  }

  public setResource(resource: EvmResource): void {
    this._resource = resource;
  }

  public getSourceNetworkProvider(): Eip1193Provider {
    return this.sourceNetworkProvider;
  }

  async isValidTransfer(): Promise<boolean> {
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const web3Provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, web3Provider);
    const { resourceId } = this.resource;
    const handlerAddress = await bridge._resourceIDToHandlerAddress(resourceId);
    return utils.isAddress(handlerAddress) && handlerAddress !== constants.AddressZero;
  }

  protected getDepositData(): string {
    return createERCDepositData(this.amount, this.destinationAddress, this.destination.parachainId);
  }

  constructor(transfer: EvmFungibleTransferRequest, config: Config) {
    super(transfer, config);
    this._amount = transfer.amount;
    this.destinationAddress = transfer.destinationAddress;
    this.securityModel = transfer.securityModel ?? SecurityModel.MPC;
  }
  /**
   * Set amount to be transferred
   * @param {BigInt} amount
   * @returns {void}
   */
  async setAmount(amount: bigint): Promise<void> {
    this._amount = amount;
    const fee = await this.getFee();
    this._amount = calculateAdjustedAmount(this, fee);
  }
  /**
   * Sets the destination address
   * @param destinationAddress
   * @returns {void}
   */
  setDestinationAddress(destinationAddress: string): void {
    this.destinationAddress = destinationAddress;
  }

  /**
   * Returns array of required approval transactions
   * @dev with permit2 we would add TypedData in the array to be signed and signature will be mandatory param into getTransaferTransaction
   * @dev potentially add optional param to override transaction params
   */
  async getApprovalTransactions(): Promise<Array<TransactionRequest>> {
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
  /**
   * Returns transaction to be signed by the user
   * @dev potentially add optional param to override transaction params
   */
  async getTransferTransaction(): Promise<TransactionRequest> {
    const domainConfig = this.config.getDomainConfig(this.source);
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(domainConfig.bridge, provider);
    const fee = await this.getFee();

    const transferTx = await erc20Transfer({
      depositData: this.getDepositData(),
      bridgeInstance: bridge,
      domainId: this.destination.id.toString(),
      resourceId: this.resource.resourceId,
      feeData: fee,
    });

    return createTransactionRequest(transferTx);
  }
}
