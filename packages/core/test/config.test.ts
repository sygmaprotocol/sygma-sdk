import { enableFetchMocks } from 'jest-fetch-mock';
import { Environment } from '../src/types.js';
import { Config } from '../src/index.js';
import { ConfigUrl } from '../src/constants.js';
import { mockedDevnetConfig } from './constants.js';

enableFetchMocks();

describe('Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(ConfigUrl.DEVNET.toString(), JSON.stringify(mockedDevnetConfig));
  });

  it('Should successfully initialize config for the corresponding environment', async function () {
    const config = new Config();
    await config.init(Environment.DEVNET);
    expect(config.configuration).toEqual(mockedDevnetConfig);
  });

  it('Should throw error if failed to fetch config', async function () {
    fetchMock.resetMocks();
    fetchMock.doMock();

    fetchMock.mockOnceIf(ConfigUrl.DEVNET.toString(), () => {
      throw new Error('Network Error');
    });

    const conf = new Config();
    const expectedError = new Error('Network Error');

    await expect(() => conf.init(Environment.DEVNET)).rejects.toThrow(expectedError);
  });

  it('Should successfully return all domains from config', async function () {
    const config = new Config();
    await config.init(Environment.DEVNET);
    const domainConfig = config.getDomainConfig({ chainId: 111 });

    expect(domainConfig.chainId).toEqual(mockedDevnetConfig.domains[0].chainId);
  });

  it("Should throw error if provided chainId doesn't have configured domain", async function () {
    fetchMock.mockIf(ConfigUrl.DEVNET.toString(), JSON.stringify({ domains: [] }));

    const expectedError = new Error('Domain configuration not found.');
    const config = new Config();
    await config.init(Environment.DEVNET);

    expect(() => config.getDomainConfig({ chainId: 115 })).toThrow(expectedError);
  });

  it('Should successfully return all resources for domain', async function () {
    const config = new Config();
    await config.init(Environment.DEVNET);
    const resources = config.getResources({ sygmaId: 112 });
    expect(resources).toEqual(mockedDevnetConfig.domains[0].resources);
  });

  it('Should successfully get all supported domains from config', async function () {
    const config = new Config();
    await config.init(Environment.DEVNET);
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
});
