import type { Domain, Config, Domainlike } from '@buildwithsygma/core';
import type { Eip1193Provider } from './types.js';

export interface BaseTransferParams {
  source: Domainlike;
  destination: Domainlike;
  sourceNetworkProvider: Eip1193Provider;
  sourceAddress: string;
}

export abstract class BaseTransfer {
  protected sourceNetworkProvider: Eip1193Provider;
  protected sourceAddress: string;
  protected destination: Domain;
  protected config: Config;
  protected source: Domain;

  constructor(transfer: BaseTransferParams, config: Config) {
    this.sourceAddress = transfer.sourceAddress;
    this.source = config.getDomain(transfer.source);
    this.destination = config.getDomain(transfer.destination);
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    this.config = config;
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
