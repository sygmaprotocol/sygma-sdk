import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types/create';
import { ChainType } from '@polkadot/types/interfaces';

const registry = new TypeRegistry();

/**
 * Retrieve the system chain and chain type from the API.
 *
 * @param {ApiPromise} api - The API instance.
 * @returns {Promise<{systemChain: string; systemChainType: ChainType}>} An object with the system chain and chain type.
 */
export const retrieveChainInfo = async (
  api: ApiPromise,
): Promise<{
  systemChain: string;
  systemChainType: ChainType;
}> => {
  const [systemChain, systemChainType] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.chainType
      ? api.rpc.system.chainType()
      : Promise.resolve(registry.createType('ChainType', 'Live') as unknown as ChainType),
  ]);

  return {
    systemChain: (systemChain || '<unknown>').toString(),
    systemChainType,
  };
};
