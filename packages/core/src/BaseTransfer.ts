import { constants } from 'ethers';
import { getSubstrateHandlerBalance, getEvmHandlerBalance } from './chains/index.js';
import type { Config } from './config/config.js';
import { Network, ResourceType } from './types.js';
import type { Domain, EvmResource, Resource, SubstrateResource } from './types.js';

export abstract class BaseTransfer {
  source: Domain;
  destination: Domain;
  resource: Resource;
  config: Config;

  constructor(
    baseTransferParams: { source: Domain; destination: Domain; resource: Resource },
    config?: Config,
  ) {
    this.source = baseTransferParams.source;
    this.destination = baseTransferParams.destination;
    this.resource = baseTransferParams.resource;
    this.config = config!;
  }

  /**
   * @param {Transfer} transfer Transfer to check
   * @param {string} destinationProviderUrl URL of the destination chain provider
   * @returns {Promise<bigint>} Handler balance on the destination chain
   * @throws {Error} No Fungible handler configured on destination domain
   */
  async fetchDestinationHandlerBalance(destinationProviderUrl: string): Promise<bigint> {
    const destinationDomainConfig = this.config.getDomainConfig(this.destination);

    const handlerAddress = destinationDomainConfig.handlers.find(
      h => h.type === ResourceType.FUNGIBLE,
    )?.address;

    if (!handlerAddress) {
      throw new Error('No Funglible handler configured on destination domain');
    }

    const destinationResource = destinationDomainConfig.resources.find(
      r => r.sygmaResourceId === this.resource.sygmaResourceId,
    );

    if (destinationResource?.burnable) {
      return BigInt(constants.MaxUint256.toString());
    }

    switch (this.destination.type) {
      case Network.EVM: {
        return getEvmHandlerBalance(
          destinationProviderUrl,
          destinationResource as EvmResource,
          handlerAddress,
        );
      }
      case Network.SUBSTRATE: {
        return getSubstrateHandlerBalance(
          destinationProviderUrl,
          destinationResource as SubstrateResource,
          handlerAddress,
        );
      }
    }
  }
}
