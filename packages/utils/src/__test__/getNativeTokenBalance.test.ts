import type { ApiPromise } from '@polkadot/api';
import type { AccountInfo } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';

import { getNativeTokenBalance } from '../substrate/balances.js';

describe('getNativeTokenBalance', () => {
  let mockApi: ApiPromise;

  beforeEach(() => {
    mockApi = {
      query: {
        system: {
          account: jest.fn(),
        },
      },
    } as unknown as ApiPromise;
  });

  it('should return the native token balance for a given account address', async () => {
    const mockAccountInfo: AccountInfo = {
      nonce: 1,
      consumers: 1,
      providers: 1,
      sufficients: 0,
      data: {
        free: new BN(1000),
        reserved: new BN(0),
        miscFrozen: new BN(0),
        feeFrozen: new BN(0),
      },
    } as unknown as AccountInfo;

    (mockApi.query.system.account as unknown as jest.Mock).mockResolvedValue(mockAccountInfo);

    const accountAddress = '5D4sHK8XJ39BfG2FnWXWJff7gPDP5x4bq8uSDA8fjU8nQ2gT';
    const result = await getNativeTokenBalance(mockApi, accountAddress);

    expect(result).toEqual(mockAccountInfo.data);
    expect(mockApi.query.system.account).toHaveBeenCalledWith(accountAddress);
  });
});
