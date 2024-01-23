import type { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types/create';
import type { Option } from '@polkadot/types';
import type { AssetBalance } from '@polkadot/types/interfaces';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { getAssetBalance } from '../utils/index.js';

const registry = new TypeRegistry();

describe('getAssetBalance', () => {
  let api: ApiPromise;
  let currentAccount: InjectedAccountWithMeta;

  beforeEach(() => {
    const assetBalance: AssetBalance = registry.createType('AssetBalance', {
      balance: 123,
    });
    const optionAssetBalance = {
      unwrapOrDefault: () => assetBalance,
    } as unknown as Option<AssetBalance>;
    api = {
      query: {
        assets: {
          account: jest.fn().mockResolvedValue(optionAssetBalance),
        },
      },
    } as unknown as ApiPromise;
    currentAccount = {
      address: '0x123',
      meta: {
        source: '',
      },
    };
  });

  it('should return the asset balance for the given account', async () => {
    const assetId = 1;

    const actualAssetBalance = await getAssetBalance(api, assetId, currentAccount.address);

    expect(actualAssetBalance.balance.toString()).toBe('123');
  });
});
