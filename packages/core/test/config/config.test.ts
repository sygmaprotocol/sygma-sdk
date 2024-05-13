import { enableFetchMocks } from 'jest-fetch-mock';
import { Environment } from '../../src/types.js';
import { Config } from '../../src/index.js';
import { ConfigUrl } from '../../src/constants.js';
import { mockedDevnetConfig, mockedMainnetConfig, mockedTestnetConfig } from '../constants.js';

enableFetchMocks();

describe('Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockOnceIf(ConfigUrl.DEVNET.toString(), JSON.stringify(mockedDevnetConfig));
    fetchMock.mockOnceIf(ConfigUrl.TESTNET.toString(), JSON.stringify(mockedTestnetConfig));
    fetchMock.mockOnceIf(ConfigUrl.MAINNET.toString(), JSON.stringify(mockedMainnetConfig));
  });

  it('Should successfully initialize config for the corresponding environment', async function () {
    const config = new Config();
    await config.init();
    expect(config.configuration.get(Environment.DEVNET)).toEqual(mockedDevnetConfig);
    expect(config.configuration.get(Environment.TESTNET)).toEqual(mockedTestnetConfig);
    expect(config.configuration.get(Environment.MAINNET)).toEqual(mockedMainnetConfig);
  });

  it('Should throw error if failed to fetch config', async function () {
    fetchMock.resetMocks();
    fetchMock.doMock();

    fetchMock.mockOnceIf(ConfigUrl.MAINNET.toString(), () => {
      throw new Error('Network Error');
    });
    fetchMock.mockOnceIf(ConfigUrl.TESTNET.toString(), () => {
      throw new Error('Network Error');
    });
    fetchMock.mockOnceIf(ConfigUrl.DEVNET.toString(), () => {
      throw new Error('Network Error');
    });

    const conf = new Config();
    const expectedError = new Error('Network Error');

    await expect(() => conf.init()).rejects.toThrow(expectedError);
  });

  it('Should successfully return all domains from config', async function () {
    const config = new Config();
    await config.init();
    const domainConfig = config.getDomainConfig(111);

    expect(domainConfig).toEqual(mockedDevnetConfig.domains[0]);
  });

  it("Should throw error if provided chainId doesn't have configured domain", async function () {
    fetchMock.mockIf(ConfigUrl.TESTNET.toString(), JSON.stringify({ domains: [] }));

    const expectedError = new Error('Domain configuration not found.');
    const config = new Config();
    await config.init();

    expect(() => config.getDomainConfig(115)).toThrow(expectedError);
  });

  it('Should successfully return all resources for domain', async function () {
    const config = new Config();
    await config.init();
    const resources = config.getResources(111);
    expect(resources).toEqual(mockedDevnetConfig.domains[0].resources);
  });

  it('Should successfully get all supported domains from config', async function () {
    const config = new Config();
    await config.init();
    const domains = config.getDomains({ environment: Environment.DEVNET });

    expect(domains).toEqual(
      mockedDevnetConfig.domains.map(({ parachainId, caipId, sygmaId, chainId, name, type }) => ({
        sygmaId,
        chainId,
        name,
        type,
        caipId,
        parachainId,
      })),
    );
  });

  it('Should fetch all configurations by default', async () => {
    const config = new Config();
    await config.init();
    let dc = config.findDomainConfig(111);
    expect(dc.environment).toEqual(Environment.DEVNET);
    dc = config.findDomainConfig(211);
    expect(dc.environment).toEqual(Environment.TESTNET);
    dc = config.findDomainConfig(311);
    expect(dc.environment).toEqual(Environment.MAINNET);
  });
});
