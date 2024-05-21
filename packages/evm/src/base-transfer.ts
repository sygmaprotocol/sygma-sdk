import type { Domain, EvmResource, Config, Domainlike } from '@buildwithsygma/core';
import { Web3Provider } from '@ethersproject/providers';
import { Bridge__factory } from '@buildwithsygma/sygma-contracts';
import { constants, utils } from 'ethers';
import type { Eip1193Provider } from './types.js';

export interface BaseTransferParams {
  source: Domainlike;
  destination: Domainlike;
  sourceNetworkProvider: Eip1193Provider;
  resource: string | EvmResource;
}

export abstract class BaseTransfer {
  sourceNetworkProvider: Eip1193Provider;
  destination: Domain;
  resource: EvmResource;
  config: Config;
  source: Domain;

  constructor(
    transfer: BaseTransferParams,
    config: Config,
  ) {
    this.source = config.getDomain(transfer.source);
    this.destination = config.getDomain(transfer.destination);
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    const resources = config.getResources(this.source);
    const resource = resources.find((res) => {
      return typeof transfer.resource === 'string' ? 
        res.sygmaResourceId === transfer.resource : 
        res.sygmaResourceId === transfer.resource.sygmaResourceId;
    });

    if (resource) {
      this.resource = resource as EvmResource;
    } else {
      throw new Error('Resource not found.');
    }

    this.config = config;
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
    const resourceId = this.resource.sygmaResourceId;
    const handlerAddress = await bridge._resourceIDToHandlerAddress(resourceId);
    return utils.isAddress(handlerAddress) && handlerAddress !== constants.AddressZero;
  }
  /**
   * Set resource to be transferred
   * @param {EvmResource} resource
   * @returns {BaseTransfer}
   */
  setResource(resource: EvmResource): void {
    this.resource = resource;
  }
  /**
   *
   * @param destination
   * @returns
   */
  setDesinationDomain(destination: string | number | Domain): void {
    const domain = this.config.getDomain(destination);
    this.destination = domain;
  }
}
