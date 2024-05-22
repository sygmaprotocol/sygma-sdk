import type { ApiPromise } from '@polkadot/api';
import { Option, Enum } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import type { XcmMultiAssetIdType } from '../../types.js';
import { FeeHandlerType } from '../../types.js';
import { getFeeHandler } from '../getFeeHandlers.js';

const registry = new TypeRegistry();

describe('Substrate - getFeeHandler', () => {
  const FEE_HANDLER_NAMES = Enum.with([
    'PercentageFeeHandler',
    'BasicFeeHandler',
    'DynamicFeeHandler',
  ]);
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

  it('should return PERCENTAGE fee handler type', async () => {
    const mockFeeHandlerType = new Option(registry, FEE_HANDLER_NAMES, 'PercentageFeeHandler');
    const api: ApiPromise = {
      query: {
        sygmaFeeHandlerRouter: {
          handlerType: jest.fn().mockResolvedValue(mockFeeHandlerType),
        },
      },
    } as unknown as ApiPromise;

    const destinationDomainId = 1;

    const feeHandlerType = await getFeeHandler(api, destinationDomainId, validXcmMultiAssetId);

    expect(feeHandlerType).toBe(FeeHandlerType.PERCENTAGE);
  });

  it('should return BASIC fee handler type', async () => {
    const mockFeeHandlerType = new Option(registry, FEE_HANDLER_NAMES, 'BasicFeeHandler');

    const api: ApiPromise = {
      query: {
        sygmaFeeHandlerRouter: {
          handlerType: jest.fn().mockResolvedValue(mockFeeHandlerType),
        },
      },
    } as unknown as ApiPromise;

    const destinationDomainId = 1;

    const feeHandlerType = await getFeeHandler(api, destinationDomainId, validXcmMultiAssetId);

    expect(feeHandlerType).toBe(FeeHandlerType.BASIC);
  });

  it('should return DYNAMIC fee handler type', async () => {
    const mockFeeHandlerType = new Option(registry, FEE_HANDLER_NAMES, 'DynamicFeeHandler');

    const api: ApiPromise = {
      query: {
        sygmaFeeHandlerRouter: {
          handlerType: jest.fn().mockResolvedValue(mockFeeHandlerType),
        },
      },
    } as unknown as ApiPromise;

    const destinationDomainId = 1;

    const feeHandlerType = await getFeeHandler(api, destinationDomainId, validXcmMultiAssetId);

    expect(feeHandlerType).toBe(FeeHandlerType.DYNAMIC);
  });

  it('should return UNDEFINED fee handler type if none is found', async () => {
    const mockFeeHandlerType = new Option(registry, FEE_HANDLER_NAMES, null);

    const api: ApiPromise = {
      query: {
        sygmaFeeHandlerRouter: {
          handlerType: jest.fn().mockResolvedValue(mockFeeHandlerType),
        },
      },
    } as unknown as ApiPromise;

    const destinationDomainId = 1;

    const feeHandlerType = await getFeeHandler(api, destinationDomainId, validXcmMultiAssetId);

    expect(feeHandlerType).toBe(FeeHandlerType.UNDEFINED);
  });

  it('should throw an error for an invalid fee handler type', async () => {
    const mockFeeHandlerType = new Option(
      registry,
      Enum.with(['InvalidFeeHandler']),
      'InvalidFeeHandler',
    );

    const api: ApiPromise = {
      query: {
        sygmaFeeHandlerRouter: {
          handlerType: jest.fn().mockResolvedValue(mockFeeHandlerType),
        },
      },
    } as unknown as ApiPromise;

    const destinationDomainId = 1;

    await expect(getFeeHandler(api, destinationDomainId, validXcmMultiAssetId)).rejects.toThrow(
      'Invalid Fee Handler Type',
    );
  });
});
