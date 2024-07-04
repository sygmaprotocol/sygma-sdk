import type { XcmMultiAssetIdType } from '@buildwithsygma/core';
import { FeeHandlerType } from '@buildwithsygma/core';
import type { ApiPromise } from '@polkadot/api';
import { u128, Option } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import { BN } from '@polkadot/util';

import { getBasicFee } from '../../utils/getBasicFee.js';

const registry = new TypeRegistry();

describe('Substrate - getBasicFee', () => {
  const validXcmMultiAssetId: XcmMultiAssetIdType = {
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
    const feeRes = await getBasicFee(api, domainId, validXcmMultiAssetId);

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

    const expectedError = new Error('Error retrieving fee.');
    const actualError = await getBasicFee(api, domainId, validXcmMultiAssetId)
      .then(res => res)
      .catch((e: Error) => e);
    expect(expectedError).toMatchObject(actualError);

    await expect(getBasicFee(api, domainId, validXcmMultiAssetId)).rejects.toThrow(
      'Error retrieving fee.',
    );
  });

  it('should throw an error for invalid domainId', async () => {
    const api: ApiPromise = {
      query: {
        sygmaBasicFeeHandler: {
          assetFees: jest.fn().mockResolvedValue({}),
        },
      },
    } as unknown as ApiPromise;
    const invalidDomainId = -1;

    await expect(getBasicFee(api, invalidDomainId, validXcmMultiAssetId)).rejects.toThrow();
  });
});
