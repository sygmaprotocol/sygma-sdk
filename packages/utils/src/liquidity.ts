import type { EvmResource, SubstrateResource, Eip1193Provider } from '@buildwithsygma/core';
import { Network, ResourceType } from '@buildwithsygma/core';
import type { createEvmFungibleAssetTransfer } from '@buildwithsygma/evm';
import { getEvmHandlerBalance } from '@buildwithsygma/evm';
import type { createSubstrateFungibleAssetTransfer } from '@buildwithsygma/substrate';
import { HttpProvider } from 'web3-providers-http';

import { getSubstrateHandlerBalance } from './substrate/balances.js';

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

  if (!handler) return false;

  switch (destination.type) {
    case Network.EVM: {
      const evmResource = domainConfig.resources.find(
        resource => transferResource.resourceId === resource.resourceId,
      ) as EvmResource;
      if (!evmResource) throw new Error();
      const provider = new HttpProvider(destinationProviderUrl);
      const evmHandlerBalance = await getEvmHandlerBalance(
        provider as unknown as Eip1193Provider,
        evmResource,
        handler.address,
      );

      if (transfer.amount > evmHandlerBalance) {
        return false;
      }

      return true;
    }
    case Network.SUBSTRATE: {
      const substrateResource = domainConfig.resources.find(
        resource => transferResource.resourceId === resource.resourceId,
      ) as SubstrateResource;

      const substrateHandlerBalance = await getSubstrateHandlerBalance(
        destinationProviderUrl,
        substrateResource,
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
