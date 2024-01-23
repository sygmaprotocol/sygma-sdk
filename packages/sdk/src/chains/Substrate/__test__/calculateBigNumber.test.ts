import type { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { calculateBigNumber } from '../utils/index.js';

describe('calculateBigNumber', () => {
  let api: ApiPromise;

  beforeEach(() => {
    api = {
      registry: {
        chainDecimals: [18],
      },
    } as unknown as ApiPromise;
  });

  it('should return a BN instance', () => {
    const amount = '1';

    const result = calculateBigNumber(api, amount);

    expect(result).toBeInstanceOf(BN);
  });

  it('should return the correct value', () => {
    const amount = '1';

    const result = calculateBigNumber(api, amount);

    expect(result.toString()).toEqual('1000000000000000000');
  });
});
