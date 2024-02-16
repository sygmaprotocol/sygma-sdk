import { enableFetchMocks } from 'jest-fetch-mock';
import { getRoutes } from '../src/utils.js';
import { ConfigUrl, Environment, IndexerUrl } from '../src/index.js';
import { testingConfigData } from './constants.js';

enableFetchMocks();

const testingRoutesData: { routes: RouteIndexerType[] } = {
  routes: [
    {
      fromDomainId: '1',
      toDomainId: '2',
      type: 'fungible',
      resourceId: '0x01',
    },
    {
      fromDomainId: '1',
      toDomainId: '3',
      type: 'gmp',
      resourceId: '0x00',
    },
  ],
};

type RouteIndexerType = {
  fromDomainId: string;
  toDomainId: string;
  resourceId: string;
  type: string;
};

describe('Utils - getRoutes', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockOnceIf(input => {
      return (
        input.url === ConfigUrl.TESTNET.toString() || input.url === ConfigUrl.MAINNET.toString()
      );
    }, JSON.stringify(testingConfigData));
  });

  it('should fetch all routes testnet', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.TESTNET}/api/routes/from/0`,
      JSON.stringify(testingRoutesData),
    );
    const allRoutes = await getRoutes(Environment.TESTNET, 6);
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch all routes mainnet', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.MAINNET}/api/routes/from/0`,
      JSON.stringify(testingRoutesData),
    );
    const allRoutes = await getRoutes(Environment.MAINNET, 6);
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch fungible routes', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.TESTNET}/api/routes/from/0?resourceType=fungible`,
      JSON.stringify({
        routes: [
          {
            fromDomainId: '1',
            toDomainId: '3',
            type: 'fungible',
            resourceId: '0x01',
          },
        ],
      }),
    );
    const allRoutes = await getRoutes(Environment.TESTNET, 6, 'fungible');
    expect(allRoutes.length).toEqual(1);
  });

  it('should throw an error on network failure', async () => {
    fetchMock.mockOnceIf(`${IndexerUrl.TESTNET}/api/routes/from/0`, () => {
      throw new Error('failed');
    });
    await expect(getRoutes(Environment.TESTNET, 6)).rejects.toThrow(
      'Failed to fetch routes because of: failed',
    );
  });

  it('should handle invalid environment input', async () => {
    await expect(getRoutes(Environment.LOCAL, 1)).rejects.toThrow('Invalid environment');
  });
});
