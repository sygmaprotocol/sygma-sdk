import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types/create';
import type { AssetBalance } from '@polkadot/types/interfaces';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { getAssetBalance } from '../utils';

const registry = new TypeRegistry();

describe('getAssetBalance', () => {
  let api: ApiPromise;
  let currentAccount: InjectedAccountWithMeta;

  beforeEach(async () => {
    const assetBalance: AssetBalance = registry.createType('AssetBalance', {
      balance: 123,
    });
    api = {
      query: {
        assets: {
          // @ts-ignore-line
          account: jest.fn().mockResolvedValue(assetBalance),
        },
      },
    };
    currentAccount = {
      address: '0x123',
      meta: {
        source: '',
      },
    };
  });

  it('should return the asset balance for the given account', async () => {
    const assetId = 1;

    const expectedAssetBalance = await api.query.assets.account(assetId, currentAccount.address);

    const actualAssetBalance = await getAssetBalance(api, assetId, currentAccount);

    expect(actualAssetBalance).toEqual(expectedAssetBalance);
  });
});
