import type { EvmResource, EthereumConfig, SubstrateConfig } from '@buildwithsygma/core';
import { Config, Environment, ResourceType } from '@buildwithsygma/core';
import type { Eip1193Provider } from '../types.js';
import { getEvmHandlerBalance } from './balances.js';

export async function getLiquidity(
  environment: Environment,
  provider: Eip1193Provider,
  resource: EvmResource,
): Promise<bigint> {
  let domain: EthereumConfig | SubstrateConfig | undefined;
  const config = new Config();
  await config.init(environment);

  const { domains } = config.getConfiguration();

  domain = domains.find(domain => {
    return !!domain.resources.find(res => res.resourceId === resource.resourceId);
  });

  if (!domain) throw new Error('Domain configuration not found.');

  const handler = domain.handlers.find(handler => handler.type === ResourceType.FUNGIBLE);
  if (!handler) throw new Error(`Fungible handler not found for chainId: ${domain.chainId}`);

  return await getEvmHandlerBalance(provider, resource, handler.address);
}
