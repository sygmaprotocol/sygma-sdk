import type { Config } from './config/config.js';
import type { Domainlike, EvmResource, Domain, SubstrateResource } from './types.js';

export interface BaseTransferParams {
  source: Domainlike;
  destination: Domainlike;
  resource: string | EvmResource | SubstrateResource;
  sourceAddress: string;
}

export abstract class BaseTransfer {
  protected destinationDomain: Domain;
  protected sourceDomain: Domain;
  protected transferResource: EvmResource | SubstrateResource;
  protected sygmaConfiguration: Config;

  protected sourceAddress: string;

  public get source(): Domain {
    return this.sourceDomain;
  }

  public get destination(): Domain {
    return this.destinationDomain;
  }

  public get resource(): EvmResource | SubstrateResource {
    return this.transferResource;
  }

  public get config(): Config {
    return this.sygmaConfiguration;
  }

  private findResource(
    resource: string | EvmResource | SubstrateResource,
  ): EvmResource | SubstrateResource | undefined {
    return this.sygmaConfiguration.getResources(this.source).find(_resource => {
      return typeof resource === 'string'
        ? resource === _resource.resourceId
        : resource.resourceId === _resource.resourceId;
    });
  }

  protected constructor(transfer: BaseTransferParams, config: Config) {
    this.sygmaConfiguration = config;
    this.sourceAddress = transfer.sourceAddress;
    this.sourceDomain = config.getDomain(transfer.source);
    this.destinationDomain = config.getDomain(transfer.destination);
    const resource = this.findResource(transfer.resource);

    if (resource) {
      this.transferResource = resource;
    } else {
      throw new Error('Resource not found.');
    }
  }
  /**
   * Method that checks whether the transfer
   * is valid and route has been registered on
   * the bridge
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async isValidTransfer(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  /**
   * Set resource to be transferred
   * @param {EvmResource} resource
   * @returns {BaseTransfer}
   */
  setResource(resource: EvmResource | SubstrateResource): void {
    this.transferResource = resource;
  }
  /**
   *
   * @param destination
   * @returns
   */
  setDesinationDomain(destination: Domainlike): void {
    const domain = this.config.getDomain(destination);
    this.destinationDomain = domain;
  }
}
