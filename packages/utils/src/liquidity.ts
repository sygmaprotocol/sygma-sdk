import type {
  EvmResource,
  SubstrateResource,
  Eip1193Provider,
  EthereumConfig,
  SubstrateConfig,
} from '@buildwithsygma/core';
import { Network, ResourceType } from '@buildwithsygma/core';
import type { createFungibleAssetTransfer } from '@buildwithsygma/evm';
import { getEvmHandlerBalance } from '@buildwithsygma/evm';
import type { createSubstrateFungibleAssetTransfer } from '@buildwithsygma/substrate/src';
/**
 * @remarks default import even if type definition says there is named and default
 */
import * as Web3ProvidersHttp from 'web3-providers-http';

import { getSubstrateHandlerBalance } from './substrate/balances.js';

/**
 * @category Utility
 * @param transfer - either an EVM or Substrate fungible asset transfer
 * @param destinationProviderUrl - URL of the destination provider
 * @returns {boolean}
 */
export async function hasEnoughLiquidity(
  transfer:
    | Awaited<ReturnType<typeof createFungibleAssetTransfer>>
    | Awaited<ReturnType<typeof createSubstrateFungibleAssetTransfer>>,
  destinationProviderUrl: string,
): Promise<boolean> {
  const { destination, resource, config } = transfer;
  const destinationDomainConfig = config.findDomainConfig(destination);
  const handler = (destinationDomainConfig as EthereumConfig | SubstrateConfig).handlers.find(
    handler => handler.type === ResourceType.FUNGIBLE,
  );

  if (!handler) throw new Error('Handler not found or unregistered for resource.');

  const destinationResource = destinationDomainConfig.resources.find(
    _resource => resource.resourceId === _resource.resourceId,
  );

  if (!destinationResource) throw new Error('Resource not found or unregistered.');

  switch (destination.type) {
    case Network.EVM: {
      const provider = new Web3ProvidersHttp.HttpProvider(destinationProviderUrl);
      const evmHandlerBalance = await getEvmHandlerBalance(
        provider as unknown as Eip1193Provider,
        resource as EvmResource,
        handler.address,
      );

      return (
        (transfer as Awaited<ReturnType<typeof createFungibleAssetTransfer>>).transferAmount <=
        evmHandlerBalance
      );
    }
    case Network.SUBSTRATE: {
      const substrateHandlerBalance = await getSubstrateHandlerBalance(
        destinationProviderUrl,
        resource as SubstrateResource,
        handler.address,
      );

      return (
        (transfer as Awaited<ReturnType<typeof createSubstrateFungibleAssetTransfer>>)
          .transferAmount <= substrateHandlerBalance
      );
    }
    // TODO: Bitcoin?
    default:
      return false;
  }
}
