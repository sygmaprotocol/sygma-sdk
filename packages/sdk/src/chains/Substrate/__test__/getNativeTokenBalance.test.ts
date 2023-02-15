/* eslint-disable */

import { ApiPromise } from '@polkadot/api';
import type { AccountData, AccountInfoWithTripleRefCount } from '@polkadot/types/interfaces';
import { TypeRegistry } from '@polkadot/types/create';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const registry = new TypeRegistry();

import { getNativeTokenBalance } from '../utils';

describe('utils', () => {
  describe('getNativeTokenBalance', () => {
    it('should return account balance', async () => {
      const accountData: AccountInfoWithTripleRefCount = registry.createType('AccountInfoWithTripleRefCount', {
        data: {
          free: 123,
        }
      });
      const api: ApiPromise = {
        query: {
          system: {
            // @ts-ignore-line
            account: jest.fn().mockResolvedValue(accountData),
          },
        },
      };
      const currentAccount: InjectedAccountWithMeta = {
        address: 'xyz',
        meta: {
          source: 'x',
        },
      };

      const balance = await getNativeTokenBalance(api, currentAccount);
      expect(balance.free.eq(123)).toBe(true);
    });
  });
});
