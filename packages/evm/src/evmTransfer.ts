import type { Config, Domain, Eip1193Provider } from '@buildwithsygma/core';
import { BaseTransfer } from '@buildwithsygma/core';
import { Web3Provider } from '@ethersproject/providers';
import { providers } from 'ethers';

import { TwapFeeCalculator } from './fee/TwapFee.js';
import { getFeeInformation, BasicFeeCalculator, PercentageFeeCalculator } from './fee/index.js';
import type { EvmFee, EvmTransferParams } from './types.js';

/**
 * @internal
 * @class EvmTransfer
 *
 * @abstract
 * Base EVM transfer class
 * housing common functionality
 */
export abstract class EvmTransfer extends BaseTransfer {
  protected provider: Eip1193Provider;

  get sourceNetworkProvider(): Eip1193Provider {
    return this.provider;
  }

  constructor(params: EvmTransferParams, config: Config) {
    super(params, config);
    this.provider = params.sourceNetworkProvider;
  }

  /**
   * Deposit Data is required
   * by the sygma protocol to process
   * transfer types
   * @returns {string}
   */
  protected getDepositData(): string {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns fee based on transfer amount.
   * @returns {Promise<EvmFee>}
   */
  public async getFee(): Promise<EvmFee> {
    const provider = new providers.Web3Provider(this.sourceNetworkProvider);

    const { feeHandlerAddress, feeHandlerType } = await getFeeInformation(
      this.config,
      provider,
      this.source.id,
      this.destination.id,
      this.resource.resourceId,
    );

    const basicFeeCalculator = new BasicFeeCalculator();
    const percentageFeeCalculator = new PercentageFeeCalculator();
    const twapFeeCalculator = new TwapFeeCalculator();

    basicFeeCalculator.setNextHandler(percentageFeeCalculator).setNextHandler(twapFeeCalculator);

    return await basicFeeCalculator.calculateFee({
      provider,
      sender: this.sourceAddress,
      sourceSygmaId: this.source.id,
      destinationSygmaId: this.destination.id,
      resourceSygmaId: this.resource.resourceId,
      feeHandlerAddress,
      feeHandlerType,
    });
  }

  public async setSource(domain: Domain, provider: Eip1193Provider): Promise<void> {
    const web3Provider = new Web3Provider(provider);
    const domainConfig = this.config.getDomainConfig(domain);

    const { chainId } = await web3Provider.getNetwork();
    if (domainConfig.chainId !== chainId) throw new Error('Inavlid network.');
    this.sourceDomain = domain;
    this.provider = provider;
  }
}
