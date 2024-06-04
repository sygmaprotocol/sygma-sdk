import type { ApiPromise } from '@polkadot/api';
import { Option, Tuple, u128 } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import { BN } from '@polkadot/util';

import { FeeHandlerType } from '../../types.js';
import type { Fungible, SubstrateResource, Transfer, XcmMultiAssetIdType } from '../../types.js';
import { getPercentageFee } from '../getPercentageFee.js';

const registry = new TypeRegistry();

describe('Substrate - getPercentageFee', () => {
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
  const validTransfer: Transfer<Fungible> = {
    resource: {
      xcmMultiAssetId: validXcmMultiAssetId,
    } as SubstrateResource,
    details: {
      amount: '1000000',
    },
    to: {
      id: 1,
    },
  } as Transfer<Fungible>;

  it('should return the percentage fee correctly', async () => {
    const feeRate = '100';
    const min = '10';
    const max = '1000';
    const rawResult = new Option(registry, Tuple.with([u128, u128, u128]), [
      new BN(feeRate),
      new BN(min),
      new BN(max),
    ]);

    const api: ApiPromise = {
      query: {
        sygmaPercentageFeeHandler: {
          assetFeeRate: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;

    const expectedFee = new BN(validTransfer.details.amount)
      .mul(new BN(feeRate))
      .div(new BN(10000));

    const calculatedFee = expectedFee.lt(new BN(min))
      ? new BN(min)
      : expectedFee.gt(new BN(max))
        ? new BN(max)
        : expectedFee;

    const feeRes = await getPercentageFee(api, validTransfer);

    expect(feeRes).toBeDefined();
    expect(feeRes).toHaveProperty('fee');
    expect(feeRes).toHaveProperty('type');
    expect(feeRes.fee).toBeInstanceOf(BN);
    expect(feeRes.fee.eq(calculatedFee)).toBe(true);
    expect(feeRes.type).toBe(FeeHandlerType.PERCENTAGE);
  });

  it('should throw an error if the fee structure is not found', async () => {
    const rawResult = new Option(registry, Tuple.with([u128, u128, u128]), null);

    const api: ApiPromise = {
      query: {
        sygmaPercentageFeeHandler: {
          assetFeeRate: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;

    await expect(getPercentageFee(api, validTransfer)).rejects.toThrow('Error retrieving fee');
  });

  it('should handle minimum fee correctly', async () => {
    const feeRate = '1';
    const min = '100';
    const max = '1000';
    const rawResult = new Option(registry, Tuple.with([u128, u128, u128]), [
      new BN(feeRate),
      new BN(min),
      new BN(max),
    ]);

    const api: ApiPromise = {
      query: {
        sygmaPercentageFeeHandler: {
          assetFeeRate: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;

    const calculatedFee = new BN(min);
    const feeRes = await getPercentageFee(api, validTransfer);

    expect(feeRes.fee.eq(calculatedFee)).toBe(true);
  });

  it('should handle maximum fee correctly', async () => {
    const feeRate = '10000';
    const min = '10';
    const max = '1000';
    const rawResult = new Option(registry, Tuple.with([u128, u128, u128]), [
      new BN(feeRate),
      new BN(min),
      new BN(max),
    ]);

    const api: ApiPromise = {
      query: {
        sygmaPercentageFeeHandler: {
          assetFeeRate: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;

    const calculatedFee = new BN(max);

    const feeRes = await getPercentageFee(api, validTransfer);

    expect(feeRes.fee.eq(calculatedFee)).toBe(true);
  });

  it('should handle exact fee correctly within min and max range', async () => {
    const feeRate = '5';
    const min = '10';
    const max = '1000';
    const rawResult = new Option(registry, Tuple.with([u128, u128, u128]), [
      new BN(feeRate),
      new BN(min),
      new BN(max),
    ]);

    const api: ApiPromise = {
      query: {
        sygmaPercentageFeeHandler: {
          assetFeeRate: jest.fn().mockResolvedValue(rawResult),
        },
      },
    } as unknown as ApiPromise;

    const expectedFee = new BN(validTransfer.details.amount)
      .mul(new BN(feeRate))
      .div(new BN(10000));

    const feeRes = await getPercentageFee(api, validTransfer);

    expect(feeRes.fee.eq(expectedFee)).toBe(true);
  });
});
