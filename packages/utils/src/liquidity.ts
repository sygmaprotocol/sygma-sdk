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
  const { destination, resource, config } = transfer;
  const destinationDomainConfig = config.findDomainConfig(destination);
  const handler = destinationDomainConfig.handlers.find(
    handler => handler.type === ResourceType.FUNGIBLE,
  );

  if (!handler) throw new Error('Handler not found or unregistered for resource.');

  const destinationResource = destinationDomainConfig.resources.find(
    _resource => resource.resourceId === _resource.resourceId,
  );

  if (!destinationResource) throw new Error('Resource not found or unregistered.');

  switch (destination.type) {
    case Network.EVM: {
      const provider = new HttpProvider(destinationProviderUrl);
      const evmHandlerBalance = await getEvmHandlerBalance(
        provider as unknown as Eip1193Provider,
        resource as EvmResource,
        handler.address,
      );

      return transfer.amount <= evmHandlerBalance;
    }
    case Network.SUBSTRATE: {
      const substrateHandlerBalance = await getSubstrateHandlerBalance(
        destinationProviderUrl,
        resource as SubstrateResource,
        handler.address,
      );

      return transfer.amount <= substrateHandlerBalance;
    }
    default:
      return false;
  }
}
