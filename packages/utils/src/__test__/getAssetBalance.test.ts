import type { ApiPromise } from '@polkadot/api';
import { Option, TypeRegistry } from '@polkadot/types';
import type { AssetBalance } from '@polkadot/types/interfaces';

import { getAssetBalance } from '../substrate/balances.js';

const registry = new TypeRegistry();
const mockApi = {
  query: {
    assets: {
      account: jest.fn(),
    },
  },
} as unknown as ApiPromise;

const mockAssetBalance: AssetBalance = registry.createType('AssetBalance', {
  balance: registry.createType('u64', 1000),
  isFrozen: registry.createType('bool', false),
  isSufficient: registry.createType('bool', false),
});

describe('getAssetBalance', () => {
  let unwrapOrDefaultSpy: jest.SpyInstance;

  beforeEach(() => {
    (mockApi.query.assets.account as unknown as jest.Mock).mockReset();
    unwrapOrDefaultSpy = jest.spyOn(Option.prototype, 'unwrapOrDefault');
  });

  afterEach(() => {
    unwrapOrDefaultSpy.mockRestore();
  });

  it('should return the asset balance when present', async () => {
    const mockOption = new Option(registry, 'AssetBalance', mockAssetBalance);
    unwrapOrDefaultSpy.mockReturnValue(mockAssetBalance);
    (mockApi.query.assets.account as unknown as jest.Mock).mockResolvedValue(mockOption);

    const result = await getAssetBalance(mockApi, 1, 'accountAddress');
    expect(result).toEqual(mockAssetBalance);
    expect(mockApi.query.assets.account).toHaveBeenCalledWith(1, 'accountAddress');
    expect(unwrapOrDefaultSpy).toHaveBeenCalled();
  });
});
