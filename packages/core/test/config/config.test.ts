import { enableFetchMocks } from 'jest-fetch-mock';
import { Environment } from '../../src/types.js';
import { Config } from '../../src/index.js';
import { ConfigUrl } from '../../src/constants.js';
import { mockedDevnetConfig, mockedMainnetConfig, mockedTestnetConfig } from '../constants.js';

enableFetchMocks();

describe('Config', () => {
  const config = new Config();

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockOnceIf(ConfigUrl.DEVNET.toString(), JSON.stringify(mockedDevnetConfig));
    fetchMock.mockOnceIf(ConfigUrl.TESTNET.toString(), JSON.stringify(mockedTestnetConfig));
    fetchMock.mockOnceIf(ConfigUrl.MAINNET.toString(), JSON.stringify(mockedMainnetConfig));
  });

  it('Should successfully initialize config for the corresponding environment', async function () {
    await config.init({ environment: Environment.DEVNET });
    expect(config.configuration).toEqual(mockedDevnetConfig);
  });

  it('Should throw error if failed to fetch config', async function () {
    fetchMock.resetMocks();
    fetchMock.doMock();

    fetchMock.mockOnceIf(ConfigUrl.MAINNET.toString(), () => {
      throw new Error('Network Error');
    });

    const conf = new Config();
    const expectedError = new Error('Configuration unavailable or uninitialized.');
    await conf.init({ environment: Environment.MAINNET });

    expect(() => conf.configuration).toThrow(expectedError);
  });

  it('Should successfully return all domains from config', async function () {
    await config.init({ environment: Environment.DEVNET });

    const domainConfig = config.getDomainConfig(111);

    expect(domainConfig).toEqual(mockedDevnetConfig.domains[0]);
  });

  it("Should throw error if provided chainId doesn't have configured domain", async function () {
    fetchMock.mockIf(ConfigUrl.TESTNET.toString(), JSON.stringify({ domains: [] }));

    const expectedError = new Error('Config for the provided domain is not setup.');
    await config.init({ environment: Environment.TESTNET });

    expect(() => config.getDomainConfig(115)).toThrow(expectedError);
  });

  it('Should successfully return all resources for domain', async function () {
    await config.init({ environment: Environment.DEVNET });

    const resources = config.getDomainResources(111);

    expect(resources).toEqual(mockedDevnetConfig.domains[0].resources);
  });

  it('Should successfully get all supported domains from config', async function () {
    await config.init({ environment: Environment.DEVNET });

    const domains = config.getDomains();

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

  it('Should fetch all configurations by default', async function () {
    await config.init({ environment: Environment.DEVNET, source: 111 });
    expect(config.environment).toEqual(Environment.DEVNET);
    await config.init({ environment: Environment.TESTNET, source: 211 });
    expect(config.environment).toEqual(Environment.TESTNET);
    await config.init({ environment: Environment.MAINNET, source: 311 });
    expect(config.environment).toEqual(Environment.MAINNET);
  });
});
