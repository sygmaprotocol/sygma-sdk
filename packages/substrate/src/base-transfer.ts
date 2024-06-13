import type { Config, Domain, Domainlike, SubstrateResource } from '@buildwithsygma/core';
import { Bridge__factory } from '@buildwithsygma/sygma-contracts';
import type { ExternalProvider } from '@ethersproject/providers';
import { Web3Provider } from '@ethersproject/providers';
import type { ApiPromise } from '@polkadot/api';
import { constants, utils } from 'ethers';

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
   * Method that checks whether the transfer
   * is valid and route has been registered on
   * the bridge
   * @returns {boolean}
   */
  async isValidTransfer(): Promise<boolean> {
    const sourceDomainConfig = this.config.getDomainConfig(this.sourceDomain);
    const web3Provider = new Web3Provider(this.sourceNetworkProvider as ExternalProvider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, web3Provider);
    const resourceId = this.resource.resourceId;
    const handlerAddress = await bridge._resourceIDToHandlerAddress(resourceId);

    return utils.isAddress(handlerAddress) && handlerAddress !== constants.AddressZero;
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
