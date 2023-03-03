import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types/create';
import { ChainType } from '@polkadot/types/interfaces';

import { retrieveChainInfo } from '../utils';

const registry = new TypeRegistry();

describe('retrieveChainInfo', () => {
  let api: ApiPromise;

  beforeEach(() => {
    api = {
      rpc: {
        system: {
          chain: jest.fn().mockResolvedValue('local'),
          chainType: jest.fn().mockResolvedValue(registry.createType('ChainType', 'Development') as unknown as ChainType),
        },
      },
    } as unknown as ApiPromise;
  });

  it('retrieves the system chain and chain type', async () => {
    const result = await retrieveChainInfo(api);

    expect(result).toEqual({
      systemChain: 'local',
      systemChainType: registry.createType('ChainType', 'Development') as unknown as ChainType,
    });
    expect(api.rpc.system.chain).toHaveBeenCalledTimes(1);
    expect(api.rpc.system.chainType).toHaveBeenCalledTimes(1);
  });

  it('handles chainType being undefined', async () => {
    (api.rpc.system.chainType as any) = undefined;

    const result = await retrieveChainInfo(api);

    expect(result).toEqual({
      systemChain: 'local',
      systemChainType: registry.createType('ChainType', 'Live') as unknown as ChainType,
    });
    expect(api.rpc.system.chain).toHaveBeenCalledTimes(1);
  });
});