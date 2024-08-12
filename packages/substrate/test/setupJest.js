require('jest-fetch-mock').enableMocks();
require('dotenv').config({ path: '.env.test' });

jest.mock('@polkadot/api', () => {
  const originalModule = jest.requireActual('@polkadot/api');

  const createMockApi = ({
    balance = {
      free: '500',
      reserved: '5000',
      miscFrozen: '5000',
      feeFrozen: '5000',
    },
    chainProperties = {
      tokenDecimals: ['12'],
      tokenSymbol: ['DOT'],
    },
  } = {}) => {
    const mockBalance = {
      data: balance,
    };

    return {
      query: {
        system: {
          account: jest.fn().mockResolvedValue(mockBalance),
        },
      },
      registry: {
        getChainProperties: jest.fn().mockReturnValue(chainProperties),
      },
    };
  };

  return {
    ...originalModule,
    WsProvider: jest.fn().mockImplementation(() => ({})),
    ApiPromise: {
      create: jest.fn().mockImplementation(config => {
        return Promise.resolve(createMockApi(config));
      }),
    },
  };
});
