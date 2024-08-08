import {
  Config,
  FeeHandlerType,
  isValidAddressForNetwork,
  ResourceType,
  SecurityModel,
} from '@buildwithsygma/core';
import type { EvmResource } from '@buildwithsygma/core';
import { Bridge__factory, ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, constants, type PopulatedTransaction, utils } from 'ethers';

import type { BaseTransferParams } from './baseTransfer.js';
import { BaseTransfer } from './baseTransfer.js';
import type { EvmFee, TransactionRequest } from './types.js';
import {
  approve,
  createERCDepositData,
  createTransactionRequest,
  erc20Transfer,
  getERC20Allowance,
} from './utils/index.js';

export interface FungibleTokenTransferRequest extends BaseTransferParams {
  resource: string | EvmResource;
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
    //calculate amount without fee (percentage)
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

export async function createEvmFungibleAssetTransfer(
  params: FungibleTokenTransferRequest,
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
class EvmFungibleAssetTransfer extends BaseTransfer {
  protected destinationAddress: string = '';
  protected securityModel: SecurityModel;
  protected _adjustedAmount: bigint = BigInt(0);
  private specifiedAmount: bigint;

  constructor(transfer: FungibleTokenTransferRequest, config: Config) {
    super(transfer, config);
    this.specifiedAmount = transfer.amount;

    if (isValidAddressForNetwork(transfer.destinationAddress, this.destination.type))
      this.destinationAddress = transfer.destinationAddress;
    this.securityModel = transfer.securityModel ?? SecurityModel.MPC;
  }

  /**
   * Returns amount to be transferred considering the fee
   */
  get adjustedAmount(): bigint {
    return this._adjustedAmount;
  }

  /**
   * Method that checks whether the transfer
   * is valid and route has been registered on
   * the bridge
   * @returns {boolean}
   */
  async isValidTransfer(): Promise<boolean> {
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const web3Provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, web3Provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.resourceId);
    return utils.isAddress(handlerAddress) && handlerAddress !== constants.AddressZero;
  }

  getDepositData(): string {
    return createERCDepositData(
      this.adjustedAmount,
      this.destinationAddress,
      this.destination.parachainId,
    );
  }

  /**
   * Set resource to be transferred
   * @param {EvmResource} resource
   * @returns {BaseTransfer}
   */
  setResource(resource: EvmResource): void {
    if (resource.type !== ResourceType.FUNGIBLE) {
      throw new Error('Resource type unsupported.');
    }
    this.resource = resource;
  }

  /**
   * Set amount to be transferred
   * @param {BigInt} amount
   * @returns {void}
   */
  async setAmount(amount: bigint): Promise<void> {
    this.specifiedAmount = amount;

    const fee = await this.getFee();
    this._adjustedAmount = calculateAdjustedAmount(amount, fee);
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
   * Returns array of required approval transactions
   * @dev with permit2 we would add TypedData in the array to be signed and signature will be mandatory param into getTransaferTransaction
   * @dev potentially add optional param to override transaction params
   */
  async getApprovalTransactions(): Promise<Array<TransactionRequest>> {
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.resourceId);

    const erc20 = ERC20__factory.connect(this.resource.address, provider);
    const fee = await this.getFee();

    await this.verifyAccountBalance();

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

    const transferAmount = BigNumber.from(this.adjustedAmount);
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

    await this.verifyAccountBalance();

    const transferTx = await erc20Transfer({
      bridgeInstance: bridge,
      domainId: this.destination.id.toString(),
      resourceId: this.resource.resourceId,
      feeData: fee,
      depositData: this.getDepositData(),
    });

    return createTransactionRequest(transferTx);
  }

  async verifyAccountBalance(): Promise<void> {
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const erc20 = ERC20__factory.connect(this.resource.address, provider);
    const balance = await erc20.balanceOf(this.sourceAddress);

    if (BigNumber.from(this.adjustedAmount).lte(0))
      throw new Error('Amount should be bigger than zero');

    if (balance.lt(this.specifiedAmount)) throw new Error('Insufficient account balance');
  }
}
