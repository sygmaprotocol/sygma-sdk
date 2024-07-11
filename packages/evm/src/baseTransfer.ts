import type {
  Domain,
  Config,
  Domainlike,
  EvmResource,
  Eip1193Provider,
} from '@buildwithsygma/core';
import { providers, utils } from 'ethers';

import { BasicFeeCalculator } from './fee/BasicFee.js';
import { PercentageFeeCalculator } from './fee/PercentageFee.js';
import { TwapFeeCalculator } from './fee/TwapFee.js';
import { getFeeInformation } from './fee/getFeeInformation.js';
import type { EvmFee } from './types.js';

export interface BaseTransferParams {
  source: Domainlike;
  destination: Domainlike;
  sourceNetworkProvider: Eip1193Provider;
  sourceAddress: string;
  resource: string | EvmResource;
}

export abstract class BaseTransfer {
  protected sourceNetworkProvider: Eip1193Provider;
  protected sourceAddress: string;
  protected destination: Domain;
  protected config: Config;
  protected source: Domain;
  protected resource: EvmResource;

  protected getDepositData(): string {
    return utils.formatBytes32String('');
  }

  constructor(transfer: BaseTransferParams, config: Config) {
    this.sourceAddress = transfer.sourceAddress;
    this.source = config.getDomain(transfer.source);
    this.destination = config.getDomain(transfer.destination);
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    this.config = config;

    const resources = config.getResources(this.source);
    const resource = resources.find(resource => {
      return typeof transfer.resource === 'string'
        ? resource.resourceId === transfer.resource
        : resource.resourceId === transfer.resource.resourceId;
    });

    if (resource) {
      this.resource = resource as EvmResource;
    } else {
      throw new Error('Resource not found.');
    }
  }
  /**
   * Returns fee based on transfer amount.
   * @param amount By default it is original amount passed in constructor
   */
  async getFee(): Promise<EvmFee> {
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
      depositData: this.getDepositData(),
    });
  }
  /**
   *
   * @param destination
   * @returns
   */
  setDesinationDomain(destination: Domainlike): void {
    const domain = this.config.getDomain(destination);
    this.destination = domain;
  }
}
