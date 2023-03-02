import { ApiPromise } from '@polkadot/api';
import { u128, Option, Null } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';

const registry = new TypeRegistry();

import { getBasicFee } from '../utils';

describe('getBasicFee', () => {
  it('should return the basic fee', async () => {
    const result = new Option(registry, u128, '0x12345678');
    const api: ApiPromise = {
      query: {
        sygmaBasicFeeHandler: {
          assetFees: jest.fn().mockResolvedValue(result),
        },
      },
    } as unknown as ApiPromise;

    const domainId = 1;
    const xsmMultiAssetId = {};

    const feeRes = await getBasicFee(api, domainId, xsmMultiAssetId);

    expect(feeRes).toBeInstanceOf(Option);
    expect(feeRes.isSome).toBeTruthy();
    expect(feeRes.unwrap()).toBeInstanceOf(u128);
  });

  it('should return none if the fee is not found', async () => {
    const result = new Option(registry, u128, null);

    const api: ApiPromise = {
      query: {
        sygmaBasicFeeHandler: {
          assetFees: jest.fn().mockResolvedValue(result),
        },
      },
    } as unknown as ApiPromise;
    const domainId = 2; // some non-existent domain id;
    const xsmMultiAssetId = {};

    const feeRes = await getBasicFee(api, domainId, xsmMultiAssetId);

    expect(feeRes).toBeInstanceOf(Option);
    expect(feeRes.isNone).toBeTruthy();
  });
});
