import type { EvmResource, SubstrateResource, Eip1193Provider } from '@buildwithsygma/core';
import { Network, ResourceType } from '@buildwithsygma/core';
import type { createEvmFungibleAssetTransfer } from '@buildwithsygma/evm';
import { getEvmHandlerBalance } from '@buildwithsygma/evm';
import { HttpProvider } from 'web3-providers-http';

import { getSubstrateHandlerBalance } from './substrate/balances.js';
import { createSubstrateFungibleAssetTransfer } from '@buildwithsygma/substrate';

export async function hasEnoughLiquidity(
  transfer:
    | Awaited<ReturnType<typeof createEvmFungibleAssetTransfer>>
    | Awaited<ReturnType<typeof createSubstrateFungibleAssetTransfer>>,
  destinationProviderUrl: string,
): Promise<boolean> {
  const destination = transfer.destination;
  const transferResource = transfer.resource;
  const config = transfer.config;
  const domainConfig = config.findDomainConfig(destination);
  const handler = domainConfig.handlers.find(handler => handler.type === ResourceType.FUNGIBLE);

  if (!handler) throw new Error('Handler not found or unregistered for resource.');

  const resource = domainConfig.resources.find(
    resource => transferResource.resourceId === resource.resourceId,
  );

  if (!resource) throw new Error('Resource not found or unregistered.');

  switch (destination.type) {
    case Network.EVM: {
      const provider = new HttpProvider(destinationProviderUrl);
      const evmHandlerBalance = await getEvmHandlerBalance(
        provider as unknown as Eip1193Provider,
        resource as EvmResource,
        handler.address,
      );

      if (transfer.amount > evmHandlerBalance) {
        return false;
      }

      return true;
    }
    case Network.SUBSTRATE: {
      const substrateHandlerBalance = await getSubstrateHandlerBalance(
        destinationProviderUrl,
        resource as SubstrateResource,
        handler.address,
      );

      if (transfer.amount > substrateHandlerBalance) {
        return false;
      }

      return true;
    }
    default:
      return false;
  }
}
