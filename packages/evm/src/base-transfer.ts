import type { Domain, EvmResource, Config } from '@buildwithsygma/core';
import { Web3Provider } from '@ethersproject/providers';
import { Bridge__factory } from '@buildwithsygma/sygma-contracts';
import { constants, utils } from 'ethers';
import type { Eip1193Provider } from './types.js';

export abstract class BaseTransfer {
  sourceNetworkProvider: Eip1193Provider;
  destination: Domain;
  resource: EvmResource;
  config: Config;
  source: Domain;

  constructor(
    transfer: {
      sourceNetworkProvider: Eip1193Provider;
      resource: EvmResource;
      destination: Domain;
      source: Domain;
    },
    config: Config,
  ) {
    this.source = transfer.source;
    this.destination = transfer.destination;
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    this.resource = transfer.resource;
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
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, provider);
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
