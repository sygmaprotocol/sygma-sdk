import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getRoutes } from '../src/utils.js';
import { Environment, IndexerUrl } from '../src/index.js';

const axiosMock = new MockAdapter(axios);

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
  afterEach(() => {
    axiosMock.reset();
  });

  it('should fetch all routes testnet', async () => {
    axiosMock
      .onGet(`${IndexerUrl.TESTNET}/api/routes/from/1?resourceType=all`)
      .reply(200, testingRoutesData);
    const allRoutes = await getRoutes(Environment.TESTNET, 1, 'all');
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch all routes mainnet', async () => {
    axiosMock
      .onGet(`${IndexerUrl.MAINNET}/api/routes/from/1?resourceType=all`)
      .reply(200, testingRoutesData);
    const allRoutes = await getRoutes(Environment.MAINNET, 1, 'all');
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch fungible routes', async () => {
    axiosMock.onGet(`${IndexerUrl.TESTNET}/api/routes/from/1?resourceType=fungible`).reply(200, {
      routes: [
        {
          fromDomainId: '1',
          toDomainId: '3',
          type: 'fungible',
          resourceId: '0x01',
        },
      ],
    });
    const allRoutes = await getRoutes(Environment.TESTNET, 1, 'fungible');
    expect(allRoutes.length).toEqual(1);
  });

  it('should throw an error on network failure', async () => {
    axiosMock.onGet(`${IndexerUrl.TESTNET}/api/routes/from/1?resourceType=all`).networkError();
    await expect(getRoutes(Environment.TESTNET, 1, 'all')).rejects.toThrow('Network Error');
  });

  it('should handle invalid environment input', async () => {
    await expect(getRoutes(Environment.LOCAL, 1, 'all')).rejects.toThrow('Invalid environment');
  });
});
