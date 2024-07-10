import { enableFetchMocks } from 'jest-fetch-mock';

import {
  ConfigUrl,
  Environment,
  IndexerUrl,
  Network,
  ResourceType,
  RouteType,
} from '../src/index.js';
import {
  getRoutes,
  isValidSubstrateAddress,
  isValidEvmAddress,
  isValidBitcoinAddress,
  isValidAddressForNetwork,
} from '../src/utils.js';

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

    const allRoutes = await getRoutes(111, Environment.TESTNET);
    expect(allRoutes.length).toEqual(2);
  });

  it('should fetch fungible routes', async () => {
    fetchMock.mockOnceIf(
      `${IndexerUrl.TESTNET}/api/routes/from/112?resourceType=fungible`,
      JSON.stringify({
        routes: mockedTestnetRoutes.routes.filter(r => r.type === ResourceType.FUNGIBLE.toString()),
      }),
    );

    const allRoutes = await getRoutes(111, Environment.TESTNET, {
      routeTypes: [RouteType.FUNGIBLE],
    });
    expect(allRoutes.length).toEqual(1);
  });

  it('should throw an error on network failure', async () => {
    fetchMock.mockOnceIf(`${IndexerUrl.TESTNET}/api/routes/from/112`, () => {
      throw new Error('failed');
    });

    await expect(getRoutes(111, Environment.TESTNET)).rejects.toThrow(
      'Failed to fetch routes because of: failed',
    );
  });

  it('should handle invalid environment input', async () => {
    fetchMock.resetMocks();
    fetchMock.mockOnceIf(ConfigUrl.DEVNET.toString(), JSON.stringify(mockedDevnetConfig));
    await expect(getRoutes(111, Environment.DEVNET)).rejects.toThrow('Invalid environment');
  });
});

describe('Address Validation Utils', () => {
  describe('isValidSubstrateAddress', () => {
    it('should validate a correct Substrate address', () => {
      const validAddress = '1v72SmRT7XHwSa6hpEhUrgspM9bpmDRNw3F4wucb2GwkynQ';
      expect(isValidSubstrateAddress(validAddress)).toBe(true);
    });

    it('should throw an error for an invalid Substrate address', () => {
      const invalidAddress = 'invalidAddress';
      expect(() => isValidSubstrateAddress(invalidAddress)).toThrow('Invalid Substrate address');
    });
  });

  describe('isValidEvmAddress', () => {
    it('should validate a correct EVM address', () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      expect(isValidEvmAddress(validAddress)).toBe(true);
    });

    it('should throw an error for an invalid EVM address', () => {
      const invalidAddress = 'invalidAddress';
      expect(() => isValidEvmAddress(invalidAddress)).toThrow('Invalid EVM address');
    });
  });

  describe('isValidBitcoinAddress', () => {
    it('should validate a correct Bitcoin address', () => {
      const validAddress = '33TbzA5AMiTKUCmeVEdsnTj3GiVXuavCAH';
      expect(isValidBitcoinAddress(validAddress)).toBe(true);
    });

    it('should throw an error for an invalid Bitcoin address', () => {
      const invalidAddress = 'invalidAddress';
      expect(() => isValidBitcoinAddress(invalidAddress)).toThrow('Invalid Bitcoin address');
    });
  });

  describe('isValidAddressForNetwork', () => {
    it('should validate a correct Substrate address for the Substrate network', () => {
      const validAddress = '423DjxJiQJNpULVt4y9Fm6Mcqv63LgANQzxumPg3or855pSY';
      expect(isValidAddressForNetwork(validAddress, Network.SUBSTRATE)).toBe(true);
    });

    it('should validate a correct EVM address for the EVM network', () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      expect(isValidAddressForNetwork(validAddress, Network.EVM)).toBe(true);
    });

    it('should validate a correct Bitcoin address for the Bitcoin network', () => {
      const validAddress = '33TbzA5AMiTKUCmeVEdsnTj3GiVXuavCAH';
      expect(isValidAddressForNetwork(validAddress, Network.BITCOIN)).toBe(true);
    });

    it('should return false for an unsupported network', () => {
      const validAddress = '5F3sa2TJAWMqDhXG6jhV4N8ko9rC2WbCVx2YQ92FsXgnAUx2';
      expect(() => isValidAddressForNetwork(validAddress, 'unsupportedNetwork' as Network)).toThrow(
        'Provided network is not supported',
      );
    });
  });
});
