import type { EvmResource, EthereumConfig, SubstrateConfig } from '@buildwithsygma/core';
import { Config, Environment, ResourceType } from '@buildwithsygma/core';
import type { Eip1193Provider } from '../types.js';
import { getEvmHandlerBalance } from './balances.js';

export async function getLiquidity(
  provider: Eip1193Provider,
  resource: EvmResource,
): Promise<bigint> {
  let domain: EthereumConfig | SubstrateConfig | undefined;
  const config = new Config();
  await config.init();

  for (const environment of Object.values(Environment)) {
    const { domains } = config.getConfiguration(environment);

    domain = domains.find(domain => {
      return !!domain.resources.find(res => res.sygmaResourceId === resource.sygmaResourceId);
    });

    if (domain) {
      break;
    }
  }

  if (!domain) throw new Error('Domain configuration not found.');

  const handler = domain.handlers.find(handler => handler.type === ResourceType.FUNGIBLE);
  if (!handler) throw new Error(`Fungible handler not found for chainId: ${domain.chainId}`);

  return await getEvmHandlerBalance(provider, resource, handler.address);
}
