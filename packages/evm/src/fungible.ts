import type { Domainlike, Domain, EvmResource } from '@buildwithsygma/core';
import { SecurityModel, Config, FeeHandlerType } from '@buildwithsygma/core';
import type { Eip1193Provider, EvmFee, TransactionRequest } from 'types.js';
import { Web3Provider } from '@ethersproject/providers';
import { Bridge__factory, ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { BigNumber, constants, utils, type PopulatedTransaction } from 'ethers';
import { approve, getERC20Allowance } from 'utils/approveAndCheckFns.js';
import { createTransactionRequest } from 'utils/transaction.js';
import { PercentageFeeCalculator } from './fee/PercentageFee.js';
import { BasicFeeCalculator } from './fee/BasicFee.js';
import { getFeeInformation } from './fee/getFeeInformation.js';
import { erc20Transfer } from './utils/depositFns.js';

type EvmFungibleTransferRequest = {
  source: Domainlike;
  sourceNetworkProvider: Eip1193Provider;
  destination: Domainlike;
  resource: string | EvmResource;
  amount: bigint;
  destinationAddress: string;
  securityModel?: SecurityModel;
};

export async function createEvmFungibleAssetTransfer(
  transferRequest: EvmFungibleTransferRequest,
): Promise<EvmFungibleAssetTransfer> {
  const {
    destination,
    source,
    resource,
    sourceNetworkProvider,
    amount,
    destinationAddress,
    securityModel,
  } = transferRequest;

  const config: Config = new Config();
  await config.init({ source });

  const destinationDomain = config.getDomain(destination);
  const sourceDomain = config.getDomain(source);

  const resources = config.getDomainResources(source);
  const evmResource = resources.find(_resource => {
    switch (typeof resource) {
      case 'object':
        return _resource.sygmaResourceId === resource.sygmaResourceId;
      case 'string':
        return _resource.sygmaResourceId === resource;
    }
  });

  if (!evmResource) throw new Error('Resource not found.');

  const transfer = new EvmFungibleAssetTransfer(
    {
      resource: evmResource as EvmResource,
      destination: destinationDomain,
      source: sourceDomain,
      sourceNetworkProvider,
      destinationAddress,
      securityModel,
      amount,
    },
    config,
  );

  const originalFee = await transfer.getFee();
  //in case of percentage fee handler, we are calculating what amount + fee will result int user inputed amount
  //in case of fixed(basic) fee handler, fee is taken from native token
  if (originalFee.type === FeeHandlerType.PERCENTAGE) {
    let _amount = amount;
    const minFee = originalFee.minFee!;
    const maxFee = originalFee.maxFee!;
    const percentage = originalFee.percentage!;
    const userInputAmount = BigNumber.from(amount);

    //calculate amount without fee (percentage)
    const feelessAmount = userInputAmount
      .mul(constants.WeiPerEther)
      .div(utils.parseEther(String(1 + percentage)));

    const calculatedFee = userInputAmount.sub(feelessAmount);
    _amount = feelessAmount.toBigInt();
    //if calculated percentage fee is less than lower fee bound, substract lower bound from user input. If lower bound is 0, bound is ignored
    if (calculatedFee.lt(minFee) && minFee > 0) {
      _amount = amount - minFee;
      // this.resourceAmount = userInputAmount.sub(minFee);
    }
    //if calculated percentage fee is more than upper fee bound, substract upper bound from user input. If upper bound is 0, bound is ignored
    if (calculatedFee.gt(maxFee) && maxFee > 0) {
      // this.resourceAmount = userInputAmount.sub(maxFee);
      _amount = amount - maxFee;
    }
    transfer.setAmount(_amount);
  }

  return transfer;
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createEvmFungibleAssetTransfer`
 */
class EvmFungibleAssetTransfer {
  sourceNetworkProvider: Eip1193Provider;
  destinationAddress: string;
  securityModel: SecurityModel;
  destination: Domain;
  resource: EvmResource;
  config: Config;
  source: Domain;
  amount: bigint;

  constructor(
    transfer: {
      source: Domain;
      sourceNetworkProvider: Eip1193Provider;
      destination: Domain;
      resource: EvmResource;
      amount: bigint;
      destinationAddress: string;
      securityModel?: SecurityModel; //defaults to MPC
    },
    config?: Config,
  ) {
    this.source = transfer.source;
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    this.destination = transfer.destination;
    this.resource = transfer.resource;
    this.amount = transfer.amount;
    this.destinationAddress = transfer.destinationAddress;
    this.securityModel = transfer.securityModel ?? SecurityModel.MPC;

    if (!config) {
      this.config = new Config();
    } else {
      this.config = config;
    }
  }
  /**
   * Set amount to be transferred
   * @param {BigInt} amount
   * @returns {EvmFungibleAssetTransfer}
   */
  setAmount(amount: bigint): EvmFungibleAssetTransfer {
    this.amount = amount;
    return this;
  }
  /**
   * Set resource to be transferred
   * @param {EvmResource} resource
   * @returns {EvmFungibleAssetTransfer}
   */
  setResource(resource: EvmResource): EvmFungibleAssetTransfer {
    this.resource = resource;
    return this;
  }
  /**
   *
   * @param destination
   * @returns
   */
  setDesinationDomain(destination: string | number | Domain): EvmFungibleAssetTransfer {
    const domain = this.config.getDomain(destination);
    this.destination = domain;
    return this;
  }
  /**
   *
   * @param destinationAddress
   * @returns
   */
  setDestinationAddress(destinationAddress: string): EvmFungibleAssetTransfer {
    this.destinationAddress = destinationAddress;
    return this;
  }
  /**
   * Returns fee based on transfer amount.
   * @param amount By default it is original amount passed in constructor
   */
  async getFee(): Promise<EvmFee> {
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const sender = await provider.getSigner().getAddress();
    const { feeHandlerAddress, feeHandlerType } = await getFeeInformation(
      this.config,
      provider,
      this.source.sygmaId,
      this.destination.sygmaId,
      this.resource.sygmaResourceId,
    );

    const basicFeeCalculator = new BasicFeeCalculator();
    const percentageFeeCalculator = new PercentageFeeCalculator();
    basicFeeCalculator.setNextHandler(percentageFeeCalculator);

    const fee = await basicFeeCalculator.calculateFee({
      provider,
      sender,
      sourceSygmaId: this.source.sygmaId,
      destinationSygmaId: this.destination.sygmaId,
      resourceSygmaId: this.resource.sygmaResourceId,
      feeHandlerAddress,
      feeHandlerType,
    });

    return fee;
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
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.sygmaResourceId);

    const erc20 = ERC20__factory.connect(this.resource.address, provider);
    const account = await provider.getSigner().getAddress();
    const fee = await this.getFee();
    const feeHandlerAllowance = await getERC20Allowance(erc20, account, fee.handlerAddress);
    const handlerAllowance = await getERC20Allowance(erc20, account, handlerAddress);

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
      amount: this.amount,
      recipientAddress: this.destinationAddress,
      parachainId: this.destination.parachainId,
      bridgeInstance: bridge,
      domainId: this.destination.sygmaId.toString(),
      resourceId: this.resource.sygmaResourceId,
      feeData: fee,
    });

    return createTransactionRequest(transferTx);
  }
}
