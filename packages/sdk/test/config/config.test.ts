import { enableFetchMocks } from 'jest-fetch-mock';
import { Environment } from '../../src/types/config.js';
import { Config } from '../../src/config/config.js';
import { testingConfigData } from '../constants.js';
import { ConfigUrl } from '../../src/constants.js';

enableFetchMocks();

describe('Config', () => {
  const config: Config = new Config();

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(ConfigUrl.DEVNET.toString(), JSON.stringify(testingConfigData));
  });

  it('Should successfully initialize config for the corresponding environment', async function () {
    // fetchMock.mockIf(ConfigUrl.DEVNET.toString(), JSON.stringify(testingConfigData));
    await config.init(6, Environment.DEVNET);

    expect(config.environment).toEqual(testingConfigData);
  });

  it('Should throw error if failed to fetch config', async function () {
    fetchMock.mockIf(ConfigUrl.MAINNET.toString(), () => {
      throw new Error('Network Error');
    });
    const expectedError = new Error('Failed to fetch shared config because of: Network Error');

    await expect(config.init(44, Environment.MAINNET)).rejects.toThrowError(expectedError);
  });

  it('Should successfully return all domains from config', async function () {
    await config.init(6, Environment.DEVNET);

    const domainConfig = config.getSourceDomainConfig();

    expect(domainConfig).toEqual(testingConfigData.domains[0]);
  });

  it("Should throw error if provided chainId doesn't have configured domain", async function () {
    fetchMock.mockIf(ConfigUrl.TESTNET.toString(), JSON.stringify({ domains: [] }));

    const expectedError = new Error('Config for the provided domain is not setup');
    await config.init(1, Environment.TESTNET);

    expect(() => config.getSourceDomainConfig()).toThrow(expectedError);
  });

  it('Should successfully return all resources for domain', async function () {
    await config.init(6, Environment.DEVNET);

    const resources = config.getDomainResources();

    expect(resources).toEqual(testingConfigData.domains[0].resources);
  });

  it('Should successfully get all supported domains from config', async function () {
    await config.init(6, Environment.DEVNET);

    const domains = config.getDomains();

    expect(domains).toEqual(
      testingConfigData.domains.map(({ id, chainId, name, type }) => ({ id, chainId, name, type })),
    );
  });
});
