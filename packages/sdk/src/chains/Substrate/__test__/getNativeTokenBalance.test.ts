import type { ApiPromise } from '@polkadot/api';
import type { AccountInfoWithTripleRefCount } from '@polkadot/types/interfaces';
import { TypeRegistry } from '@polkadot/types/create';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { getNativeTokenBalance } from '../utils/index.js';

const registry = new TypeRegistry();

describe('getNativeTokenBalance', () => {
  it('should return account balance', async () => {
    const accountData: AccountInfoWithTripleRefCount = registry.createType(
      'AccountInfoWithTripleRefCount',
      {
        data: {
          free: 123,
        },
      },
    );
    const api = {
      query: {
        system: {
          account: jest.fn().mockResolvedValue(accountData),
        },
      },
    } as unknown as ApiPromise;
    const currentAccount: InjectedAccountWithMeta = {
      address: 'xyz',
      meta: {
        source: 'x',
      },
    };

    const balance = await getNativeTokenBalance(api, currentAccount.address);
    expect(balance.free.eq(123)).toBe(true);
  });
});
