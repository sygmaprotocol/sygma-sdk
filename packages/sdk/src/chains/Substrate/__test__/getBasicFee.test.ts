import type { ApiPromise } from '@polkadot/api';
import { u128, Option } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import { BN } from '@polkadot/util';
import { FeeHandlerType } from '../../../types/index.js';
import type { XcmMultiAssetIdType } from '../utils/index.js';
import { getBasicFee } from '../utils/index.js';

const registry = new TypeRegistry();

describe('Substrate - getBasicFee', () => {
  it('should return the basic fee', async () => {
    const mockFee = '100000';
    const mockFeeBN = new BN(mockFee);
    const rawResult = new Option(registry, u128, mockFee);

    const api: ApiPromise = {
      query: {
        sygmaBasicFeeHandler: {
          assetFees: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;

    const domainId = 1;
    const xcmMultiAssetId: XcmMultiAssetIdType = {
      concrete: {
        parents: 1,
        interior: {
          x3: [
            {
              parachain: 2004,
            },
            {
              generalKey: [5, '0x12345'],
            },
            {
              generalKey: [4, '0x1234'],
            },
          ],
        },
      },
    };

    const feeRes = await getBasicFee(api, domainId, xcmMultiAssetId);

    expect(feeRes).toBeDefined();
    expect(feeRes).toHaveProperty('fee');
    expect(feeRes).toHaveProperty('type');
    expect(feeRes.fee).toBeInstanceOf(BN);
    expect(feeRes.fee.eq(mockFeeBN)).toBe(true);
    expect(feeRes.type).toBe(FeeHandlerType.BASIC);
  });

  it('should throw and error if the fee is not found', async () => {
    const rawResult = new Option(registry, u128, null);

    const api: ApiPromise = {
      query: {
        sygmaBasicFeeHandler: {
          assetFees: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;
    const domainId = 2; // some non-existent domain id;
    const xcmMultiAssetId: XcmMultiAssetIdType = {
      concrete: {
        parents: 1,
        interior: {
          x3: [
            {
              parachain: 2004,
            },
            {
              generalKey: [5, '0x12345'],
            },
            {
              generalKey: [4, '0x1234'],
            },
          ],
        },
      },
    };

    const expectedError = new Error('Error retrieving fee');
    const actualError = await getBasicFee(api, domainId, xcmMultiAssetId)
      .then(res => res)
      .catch((e: Error) => e);
    expect(expectedError).toMatchObject(actualError);
  });
});
