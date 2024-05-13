import { enableFetchMocks } from 'jest-fetch-mock';
import { getRoutes } from '../src/utils.js';
import { ConfigUrl, IndexerUrl, ResourceType, RouteType } from '../src/index.js';
import { mockedDevnetConfig, mockedMainnetConfig, mockedTestnetConfig } from './constants.js';

const mockedTestnetRoutes: { routes: RouteIndexerType[] } = {
  routes: [
    {
      fromDomainId: '212',
      toDomainId: '222',
      type: 'fungible',
      resourceId: '0x01',
    },
    {
      fromDomainId: '212',
      toDomainId: '222',
      type: 'gmp',
      resourceId: '0x00',
    },
  ],
};

const mockedMainnetRoutes: { routes: RouteIndexerType[] } = {
  routes: [
    {
      fromDomainId: '312',
      toDomainId: '322',
      type: 'fungible',
      resourceId: '0x01',
    },
    {
      fromDomainId: '312',
      toDomainId: '322',
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

enableFetchMocks();

describe('Utils - getRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockOnceIf(ConfigUrl.DEVNET.toString(), JSON.stringify(mockedDevnetConfig));
    fetchMock.mockOnceIf(ConfigUrl.TESTNET.toString(), JSON.stringify(mockedTestnetConfig));
    fetchMock.mockOnceIf(ConfigUrl.MAINNET.toString(), JSON.stringify(mockedMainnetConfig));
  });

  it('should fetch all routes testnet', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.TESTNET}/api/routes/from/212`,
      JSON.stringify(mockedTestnetRoutes),
    );
    const allRoutes = await getRoutes(211);
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch all routes mainnet', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.MAINNET}/api/routes/from/312`,
      JSON.stringify(mockedMainnetRoutes),
    );

    const allRoutes = await getRoutes(311);
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch fungible routes', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.TESTNET}/api/routes/from/212?resourceType=fungible`,
      JSON.stringify({
        routes: mockedTestnetRoutes.routes.filter(r => r.type === ResourceType.FUNGIBLE.toString()),
      }),
    );

    const allRoutes = await getRoutes(211, { routeTypes: [RouteType.FUNGIBLE] });
    expect(allRoutes.length).toEqual(1);
  });

  it('should throw an error on network failure', async () => {
    fetchMock.mockOnceIf(`${IndexerUrl.TESTNET}/api/routes/from/212`, () => {
      throw new Error('failed');
    });

    await expect(getRoutes(211)).rejects.toThrow('Failed to fetch routes because of: failed');
  });

  it('should handle invalid environment input', async () => {
    await expect(getRoutes(111)).rejects.toThrow('Invalid environment');
  });
});
