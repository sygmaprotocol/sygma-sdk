import type { Config, Domain, Domainlike, SubstrateResource } from '@buildwithsygma/core';
import type { ApiPromise } from '@polkadot/api';

interface BaseTransferParams {
  sourceDomain: Domainlike;
  destinationDomain: Domainlike;
  sourceNetworkProvider: ApiPromise;
  resource: string | SubstrateResource;
}

export abstract class BaseTransfer {
  sourceDomain: Domain;
  destinationDomain: Domain;
  sourceNetworkProvider: ApiPromise;
  resource: SubstrateResource;
  config: Config;

  protected constructor(transfer: BaseTransferParams, config: Config) {
    this.sourceDomain = config.getDomain(transfer.sourceDomain);
    this.destinationDomain = config.getDomain(transfer.destinationDomain);
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;

    const resources = config.getResources(this.sourceDomain) as SubstrateResource[];
    const resource = this.findResource(resources, transfer.resource);

    if (resource) {
      this.resource = resource;
    } else {
      throw new Error('Resource not found.');
    }

    this.config = config;
  }

  private findResource(
    resources: SubstrateResource[],
    resourceIdentifier: string | SubstrateResource,
  ): SubstrateResource | undefined {
    return resources.find(res => {
      return typeof resourceIdentifier === 'string'
        ? res.resourceId === resourceIdentifier
        : res.resourceId === resourceIdentifier.resourceId;
    });
  }

  /**
   * Set resource to be transferred.
   * @param {SubstrateResource} resource
   */
  setResource(resource: SubstrateResource): void {
    this.resource = resource;
  }

  /**
   * Set the destination domain.
   * @param {Domainlike} destination
   */
  setDestinationDomain(destination: Domainlike): void {
    this.destinationDomain = this.config.getDomain(destination);
  }
}
