import type {
  Domainlike,
  Domain,
  EvmResource,
  EthereumConfig,
  SubstrateConfig,
} from '@buildwithsygma/core';
import {
  SecurityModel,
  Config,
  FeeHandlerType,
  Environment,
  ResourceType,
} from '@buildwithsygma/core';
import type { Eip1193Provider, EvmFee, TransactionRequest } from 'types.js';
import { Web3Provider } from '@ethersproject/providers';
import { Bridge__factory, ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { BigNumber, type PopulatedTransaction } from 'ethers';
import { approve, getERC20Allowance } from 'utils/approveAndCheckFns.js';
import { createTransactionRequest } from 'utils/transaction.js';
import { PercentageFeeCalculator } from './fee/PercentageFee.js';
import { BasicFeeCalculator } from './fee/BasicFee.js';
import { getFeeInformation } from './fee/getFeeInformation.js';
import { erc20Transfer } from './utils/depositFns.js';
import { getEvmHandlerBalance } from './utils/balances.js';

export async function getLiquidity(
  provider: Eip1193Provider,
  resource: EvmResource,
): Promise<bigint> {
  let domain: EthereumConfig | SubstrateConfig | undefined;
  const config = new Config();
  await config.init();

  for (const environment of Object.values(Environment)) {
    const configuration = config.getConfiguration(environment);
    domain = configuration.domains.find(domain => {
      const isResourceOfDomain = domain.resources.find(res => {
        return res.sygmaResourceId === resource.sygmaResourceId;
      });

      return !!isResourceOfDomain;
    });

    if (domain !== undefined) {
      break;
    }
  }

  if (!domain) {
    throw new Error('Domain configuration not found.');
  }

  const handler = domain.handlers.find(handler => handler.type === ResourceType.FUNGIBLE);

  if (!handler) {
    throw new Error(`Fungible handler not found for chainId: ${domain.chainId}`);
  }

  return await getEvmHandlerBalance(provider, resource, handler.address);
}

/**
 * Return amount of liquidity tokens on resource handler
 * @param provider
 * @param resource
 */
// export function getLiquidity(provider: Eip1193Provider, resource: EvmResource): Promise<bigint> {
//   return Promise.resolve(BigInt(0));
// }

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
  const config: Config = new Config();
  await config.init({ source: transferRequest.source });

  const { resource, sourceNetworkProvider, amount, destinationAddress, securityModel } =
    transferRequest;

  const source = config.getDomain(transferRequest.source);
  const destination = config.getDomain(transferRequest.destination);
  const resources = config.getDomainResources(source);

  const evmResource = resources.find(_resource => {
    switch (typeof resource) {
      case 'object':
        return _resource.sygmaResourceId === resource.sygmaResourceId;
      case 'string':
        return _resource.sygmaResourceId === resource;
    }
  });

  if (!evmResource) {
    throw new Error('Resource not configured');
  }

  const assetTransfer = new EvmFungibleAssetTransfer(
    {
      source,
      destination,
      sourceNetworkProvider: sourceNetworkProvider,
      resource: evmResource as EvmResource,
      amount,
      destinationAddress,
      securityModel,
    },
    config,
  );

  return assetTransfer;
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createEvmFungibleAssetTransfer`
 */
class EvmFungibleAssetTransfer {
  config: Config;
  source: Domain;
  destination: Domain;

  sourceNetworkProvider: Eip1193Provider;

  resource: EvmResource;

  amount: bigint;
  destinationAddress: string;
  securityModel: SecurityModel;

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

  setAmount(amount: bigint): EvmFungibleAssetTransfer {
    this.amount = amount;
    return this;
  }
  setResource(resource: EvmResource): EvmFungibleAssetTransfer {
    this.resource = resource;
    return this;
  }
  setDesinationDomain(destination: string | number | Domain): EvmFungibleAssetTransfer {
    const domain = this.config.getDomain(destination);
    this.destination = domain;
    return this;
  }
  setDestinationAddress(destinationAddress: string): EvmFungibleAssetTransfer {
    this.destinationAddress = destinationAddress;
    return this;
  }

  /**
   * Returns fee based on transfer amount.
   * @param amount By default it is original amount passed in constructor
   */
  async getFee(amount?: bigint): Promise<EvmFee> {
    if (amount) {
      this.amount = amount;
    }

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
    const approvals: Array<PopulatedTransaction> = [];
    const sourceDomainConfig = this.config.getDomainConfig(this.source);

    const provider = new Web3Provider(this.sourceNetworkProvider);
    const erc20 = ERC20__factory.connect(this.resource.address, provider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, provider);

    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.sygmaResourceId);
    const fee = await this.getFee();

    const spender = await provider.getSigner().getAddress();
    const feeHandlerAllowance = await getERC20Allowance(erc20, spender, fee.handlerAddress);
    const handlerAllowance = await getERC20Allowance(erc20, spender, handlerAddress);

    if (fee.type == FeeHandlerType.PERCENTAGE && feeHandlerAllowance.lt(fee.fee)) {
      approvals.push(await approve(erc20, fee.handlerAddress, BigNumber.from(fee.fee).toString()));
    }

    const transferAmount = BigNumber.from(this.amount);
    if (handlerAllowance.lt(transferAmount)) {
      approvals.push(
        await approve(erc20, handlerAddress, BigNumber.from(transferAmount).toString()),
      );
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
