import type { Eip1193Provider } from '@buildwithsygma/core';
import { Config, Network, ResourceType } from '@buildwithsygma/core';
import {
  BasicFeeHandler__factory,
  Bridge__factory,
  FeeHandlerRouter__factory,
} from '@buildwithsygma/sygma-contracts';

import { createCrossChainContractCall } from '../generic.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@buildwithsygma/core', () => ({
  ...jest.requireActual('@buildwithsygma/core'),
  Config: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ethersproject/providers', () => ({
  ...jest.requireActual('@ethersproject/providers'),
  Web3Provider: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@buildwithsygma/sygma-contracts', () => ({
  ...jest.requireActual('@buildwithsygma/sygma-contracts'),
  BasicFeeHandler__factory: {
    connect: jest.fn(),
  },
  Bridge__factory: {
    connect: jest.fn(),
  },
  FeeHandlerRouter__factory: {
    connect: jest.fn(),
  },
}));

const CONFIG_MOCK_WITHOUT_RESOURCE = {
  init: jest.fn().mockResolvedValue(undefined),
  getResources: jest.fn().mockReturnValue([]),
  getDomains: jest.fn().mockReturnValue([]),
  getDomain: jest.fn().mockReturnValue({}),
};

const CONFIG_MOCK_WITH_FUNGIBLE_RESOURCE = {
  init: jest.fn().mockResolvedValue(undefined),
  getResources: jest.fn().mockReturnValue([{ resourceId: '0x00', type: ResourceType.FUNGIBLE }]),
  getDomains: jest.fn().mockReturnValue([]),
  getDomain: jest.fn().mockReturnValue({}),
  getDomainConfig: jest.fn().mockReturnValue({ type: Network.EVM }),
  findDomainConfigBySygmaId: jest.fn().mockReturnValue({}),
};

const CONFIG_MOCK_WITH_GENERIC_RESOURCE = {
  init: jest.fn().mockResolvedValue(undefined),
  getResources: jest
    .fn()
    .mockReturnValue([{ resourceId: '0x00', type: ResourceType.PERMISSIONED_GENERIC }]),
  getDomains: jest.fn().mockReturnValue([]),
  getDomain: jest.fn().mockReturnValue({}),
  getDomainConfig: jest.fn().mockReturnValue({ type: Network.EVM }),
  findDomainConfigBySygmaId: jest.fn().mockReturnValue({}),
};

export const mockContract = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_depositer',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_index',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'store',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_index',
        type: 'address',
      },
    ],
    name: 'retrieve',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const contractFunctionParams = [
  '0x98729c03c4D5e820F5e8c45558ae07aE63F97461' as `0x${string}`,
  '0x98729c03c4D5e820F5e8c45558ae07aE63F97461' as `0x${string}`,
  BigInt(100),
] as const;

describe('createCrossChainContractCall', () => {
  const params = {
    gasLimit: BigInt(0),
    functionParameters: contractFunctionParams,
    functionName: 'store' as const,
    destinationContractAbi: mockContract,
    destinationContractAddress: '',
    maxFee: BigInt(0),
    source: 1,
    destination: 2,
    sourceNetworkProvider: {} as unknown as Eip1193Provider,
    sourceAddress: '',
    resource: '0x00',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (Bridge__factory.connect as jest.Mock).mockReturnValue({
      _feeHandler: jest.fn().mockResolvedValue('0x0000000000000000000000000000000000000000'),
    });

    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('twap'),
    });
  });

  it('should not create a transfer with invalid resource', async () => {
    (Config as jest.Mock).mockReturnValue(CONFIG_MOCK_WITHOUT_RESOURCE);

    await expect(
      async () => await createCrossChainContractCall<typeof mockContract, 'store'>(params),
    ).rejects.toThrow('Resource not found.');
  });

  it('should fail if incorrect resource is provided', async () => {
    (Config as jest.Mock).mockReturnValue(CONFIG_MOCK_WITH_FUNGIBLE_RESOURCE);

    await expect(
      async () => await createCrossChainContractCall<typeof mockContract, 'store'>(params),
    ).rejects.toThrow('Invalid transfer.');
  });

  it('should fail if fee information is incorrectly set or unset', async () => {
    (Config as jest.Mock).mockReturnValue(CONFIG_MOCK_WITH_GENERIC_RESOURCE);

    (FeeHandlerRouter__factory.connect as jest.Mock).mockReturnValue({
      _domainResourceIDToFeeHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x0000000000000000000000000000000000000000'),
    });

    await expect(
      async () => await createCrossChainContractCall<typeof mockContract, 'store'>(params),
    ).rejects.toThrow('Failed getting fee: route not registered on fee handler');
  });

  it('should create a transfer object if fee is configured properly', async () => {
    (Config as jest.Mock).mockReturnValue(CONFIG_MOCK_WITH_GENERIC_RESOURCE);

    (FeeHandlerRouter__factory.connect as jest.Mock).mockReturnValue({
      _domainResourceIDToFeeHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
    });

    const transfer = await createCrossChainContractCall<typeof mockContract, 'store'>(params);
    expect(transfer.functionName).toEqual('store');
  });
});
