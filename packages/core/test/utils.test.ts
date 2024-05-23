import { enableFetchMocks } from 'jest-fetch-mock';
import { getRoutes } from '../src/utils.js';
import { ConfigUrl, Environment, IndexerUrl, ResourceType, RouteType } from '../src/index.js';
import { mockedDevnetConfig } from './constants.js';

type RouteIndexerType = {
  fromDomainId: string;
  toDomainId: string;
  resourceId: string;
  type: string;
};

const mockedTestnetRoutes: { routes: RouteIndexerType[] } = {
  routes: [
    {
      fromDomainId: '112',
      toDomainId: '112',
      type: 'fungible',
      resourceId: '0x01',
    },
    {
      fromDomainId: '112',
      toDomainId: '112',
      type: 'gmp',
      resourceId: '0x00',
    },
  ],
};

enableFetchMocks();

describe('Utils - getRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockOnceIf(ConfigUrl.TESTNET.toString(), JSON.stringify(mockedDevnetConfig));
  });

  it('should fetch all routes testnet', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.TESTNET}/api/routes/from/112`,
      JSON.stringify(mockedTestnetRoutes),
    );

    const allRoutes = await getRoutes(Environment.TESTNET, 111);
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch fungible routes', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.TESTNET}/api/routes/from/112?resourceType=fungible`,
      JSON.stringify({
        routes: mockedTestnetRoutes.routes.filter(r => r.type === ResourceType.FUNGIBLE.toString()),
      }),
    );

    const allRoutes = await getRoutes(Environment.TESTNET, 111, { routeTypes: [RouteType.FUNGIBLE] });
    expect(allRoutes.length).toEqual(1);
  });

  it('should throw an error on network failure', async () => {
    fetchMock.mockOnceIf(`${IndexerUrl.TESTNET}/api/routes/from/112`, () => {
      throw new Error('failed');
    });

    await expect(getRoutes(Environment.TESTNET, 111)).rejects.toThrow('Failed to fetch routes because of: failed');
  });

  it('should handle invalid environment input', async () => {
    fetchMock.resetMocks();
    fetchMock.mockOnceIf(ConfigUrl.DEVNET.toString(), JSON.stringify(mockedDevnetConfig));
    await expect(getRoutes(Environment.DEVNET, 111)).rejects.toThrow('Invalid environment');
  });
});
