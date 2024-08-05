import { Contract } from 'ethers';

import { getFeeHandlerAddressesOfRoutes, getFeeHandlerTypeOfRoutes } from '../src/multicall.js';
import type { Eip1193Provider } from '../src/types.js';
import { RouteType } from '../src/types.js';

const mockedIndexerRoutes = [
  {
    fromDomainId: '1',
    toDomainId: '2',
    resourceId: '',
    type: RouteType.FUNGIBLE,
  },
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      Bridge__factory: {
        connect: jest.fn().mockReturnValue({
          _feeHandler: jest.fn().mockResolvedValue('0x0000000000000000000000000000000000000000'),
        }),
      },
      BasicFeeHandler__factory: {
        createInterface: jest.fn().mockReturnValue({
          encodeFunctionData: jest.fn().mockReturnValue(''),
        }),
      },
      FeeHandlerRouter__factory: {
        createInterface: jest.fn().mockReturnValue({
          encodeFunctionData: jest.fn().mockReturnValue(''),
        }),
      },
    }) as unknown,
);

jest.mock(
  '@ethersproject/providers',
  () =>
    ({
      ...jest.requireActual('@ethersproject/providers'),
      Web3Provider: jest.fn().mockResolvedValue({}),
    }) as unknown,
);

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));

describe('Multicall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getFeeHandlerAddressesOfRoutes - should fetch addresses from the chain', async () => {
    (Contract as unknown as jest.Mock).mockImplementationOnce(() => {
      return {
        callStatic: {
          aggregate: jest.fn().mockResolvedValue({
            returnData: [
              '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000',
              '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000',
            ],
          }),
        },
      };
    });

    const routes = await getFeeHandlerAddressesOfRoutes({
      routes: mockedIndexerRoutes,
      chainId: 1,
      bridgeAddress: ZERO_ADDRESS,
      provider: {} as unknown as Eip1193Provider,
    });

    routes.forEach(route => expect(route.feeHandlerAddress).toBeTruthy());
    expect(routes.length).toEqual(mockedIndexerRoutes.length);
  });

  it('getFeeHandlerAddressesOfRoutes - should throw an error if unable to fech data from the chain', async () => {
    (Contract as unknown as jest.Mock).mockImplementation(() => {
      return {
        callStatic: {
          aggregate: jest.fn().mockRejectedValue(new Error('Network Error.')),
        },
      };
    });

    await expect(() =>
      getFeeHandlerAddressesOfRoutes({
        routes: mockedIndexerRoutes,
        chainId: 1,
        bridgeAddress: ZERO_ADDRESS,
        provider: {} as unknown as Eip1193Provider,
      }),
    ).rejects.toThrow('Network Error.');
  });

  it('getFeeHandlerTypeOfRoutes - should fetch type from the chain', async () => {
    (Contract as unknown as jest.Mock).mockImplementation(() => {
      return {
        callStatic: {
          aggregate: jest.fn().mockReturnValue({
            returnData: ['percentage', 'basic'],
          }),
        },
      };
    });

    const routes = await getFeeHandlerTypeOfRoutes({
      routes: mockedIndexerRoutes.map(route => {
        return {
          ...route,
          feeHandlerAddress: ZERO_ADDRESS,
        };
      }),
      chainId: 1,
      provider: {} as unknown as Eip1193Provider,
    });

    routes.forEach(route => expect(route.feeHandlerType).toBeTruthy());
    expect(routes.length).toEqual(mockedIndexerRoutes.length);
  });

  it('getFeeHandlerTypeOfRoutes - should throw an error if unable to fech data from the chain', async () => {
    (Contract as unknown as jest.Mock).mockImplementation(() => {
      return {
        callStatic: {
          aggregate: jest.fn().mockRejectedValue(new Error('Network Error.')),
        },
      };
    });

    await expect(() =>
      getFeeHandlerTypeOfRoutes({
        routes: mockedIndexerRoutes.map(route => {
          return {
            ...route,
            feeHandlerAddress: ZERO_ADDRESS,
          };
        }),
        chainId: 1,
        provider: {} as unknown as Eip1193Provider,
      }),
    ).rejects.toThrow('Network Error.');
  });
});
