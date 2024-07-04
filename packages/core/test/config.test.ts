import { enableFetchMocks } from 'jest-fetch-mock';

import { ConfigUrl } from '../src/constants.js';
import { Config } from '../src/index.js';
import { Environment } from '../src/types.js';

import { mockedDevnetConfig } from './constants.js';

enableFetchMocks();

describe('Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(ConfigUrl.DEVNET.toString(), JSON.stringify(mockedDevnetConfig));
  });

  // Failing because random caip19 and caip ids, need to update that
  it('Should successfully initialize config for the corresponding environment', async function () {
    const config = new Config();
    await config.init(Environment.DEVNET);
    expect(config.configuration.domains).toEqual(mockedDevnetConfig.domains);
  });

  it('Should throw error if failed to fetch config', async function () {
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
    const domainConfig = config.getDomainConfig(111);

    expect(domainConfig.chainId).toEqual(mockedDevnetConfig.domains[0].chainId);
  });

  it("Should throw error if provided chainId doesn't have configured domain", async function () {
    fetchMock.mockIf(ConfigUrl.DEVNET.toString(), JSON.stringify({ domains: [] }));

    const expectedError = new Error('Domain configuration not found.');
    const config = new Config();
    await config.init(Environment.DEVNET);

    expect(() => config.getDomainConfig(115)).toThrow(expectedError);
  });

  it('Should successfully get all supported domains from config', async function () {
    const config = new Config();
    await config.init(Environment.DEVNET);
    const domains = config.getDomains();

    expect(domains).toEqual(
      mockedDevnetConfig.domains.map(({ parachainId, caipId, id, chainId, name, type }) => ({
        id,
        chainId,
        name,
        type,
        caipId,
        parachainId,
      })),
    );
  });

  // Failing because random caip19 and caip ids, need to update that
  it('Should successfully return all resources for domain', async function () {
    const config = new Config();
    await config.init(Environment.DEVNET);
    const resources = config.getResources(111);
    expect(resources).toEqual(mockedDevnetConfig.domains[0].resources);
  });
});
