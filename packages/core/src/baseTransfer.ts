import type { Config } from './config/config.js';
import type { Domainlike, EvmResource, Domain, SubstrateResource } from './types.js';

export interface BaseTransferParams {
  source: Domainlike;
  destination: Domainlike;
  resource: string | EvmResource | SubstrateResource;
  sourceAddress: string;
}

export abstract class BaseTransfer {
  protected _destination: Domain;
  protected _resource: EvmResource | SubstrateResource;
  protected _source: Domain;
  protected _config: Config;

  protected sourceAddress: string;

  public get source(): Domain {
    return this._source;
  }

  public get destination(): Domain {
    return this._destination;
  }

  public get resource(): EvmResource | SubstrateResource {
    return this._resource;
  }

  public get config(): Config {
    return this._config;
  }

  private findResource(
    resource: string | EvmResource | SubstrateResource,
  ): EvmResource | SubstrateResource | undefined {
    return this._config.getResources(this.source).find(_resource => {
      return typeof resource === 'string'
        ? resource === _resource.resourceId
        : resource.resourceId === _resource.resourceId;
    });
  }

  constructor(transfer: BaseTransferParams, config: Config) {
    this._config = config;
    this.sourceAddress = transfer.sourceAddress;
    this._source = config.getDomain(transfer.source);
    this._destination = config.getDomain(transfer.destination);
    const __resource = this.findResource(transfer.resource);

    if (__resource) {
      this._resource = __resource;
    } else {
      throw new Error('Resource not found.');
    }

    this._config = config;
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
    this._resource = resource;
  }
  /**
   *
   * @param destination
   * @returns
   */
  setDesinationDomain(destination: Domainlike): void {
    const domain = this.config.getDomain(destination);
    this._destination = domain;
  }
}