import { ApiPromise } from '@polkadot/api';
import { u128, Option } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import { BigNumber } from 'ethers';
import { FeeHandlerType } from 'types/types.js';
import { getBasicFee } from '../utils/index.js';

const registry = new TypeRegistry();

describe('Substrate - getBasicFee', () => {
  it('should return the basic fee', async () => {
    const mockFee = '0x12345678';
    const rawResult = new Option(registry, u128, mockFee);

    const api: ApiPromise = {
      query: {
        sygmaBasicFeeHandler: {
          assetFees: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;

    const domainId = 1;
    const xsmMultiAssetId = {};

    const feeRes = await getBasicFee(api, domainId, xsmMultiAssetId);

    expect(feeRes).toBeDefined();
    expect(feeRes).toHaveProperty('Fee');
    expect(feeRes).toHaveProperty('type');
    expect(feeRes.fee).toBeInstanceOf(BigNumber);
    expect(feeRes.fee).toBe(BigNumber.from(mockFee));
    expect(feeRes.type).toBe(FeeHandlerType.BASIC);
  });

  it('should throw and error if the fee is not found', () => {
    const rawResult = new Option(registry, u128, null);

    const api: ApiPromise = {
      query: {
        sygmaBasicFeeHandler: {
          assetFees: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;
    const domainId = 2; // some non-existent domain id;
    const xsmMultiAssetId = {};

    expect(async () => {
      await getBasicFee(api, domainId, xsmMultiAssetId);
    }).toThrow();
  });
});
