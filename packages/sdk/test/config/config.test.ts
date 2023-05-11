import fetch, { Response, RequestInfo } from 'node-fetch';
import { Environment } from '../../src/types/config';
import { Config } from '../../src/config';
import { testingConfigData } from '../constants';
import {ConfigUrl} from '../../src/constants';

jest.mock('node-fetch');

describe('Config', () => {
  let config: Config = new Config();

  let fetchMock = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      if (url === ConfigUrl.DEVNET) {
        return Promise.resolve({
          json: jest.fn().mockResolvedValue(testingConfigData),
        } as unknown as Response);
      } else if (url === ConfigUrl.TESTNET) {
        // mock not configured domain
        return Promise.resolve({
          json: jest.fn().mockResolvedValue({
            domains: []
          }) as unknown as Response,
        } as unknown as Response);
      } else {
        return Promise.reject()
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Should successfully initialize config for the corresponding environment', async function () {
    await config.init(1, Environment.DEVNET);

    expect(config.environment).toEqual(testingConfigData);
  });

  it('Should throw error if failed to fetch config', async function () {
    const expectedError = new Error("Something went wrong while fetching config file");

    await expect(config.init(44, Environment.MAINNET)).rejects.toThrowError(expectedError);
  });

  it('Should successfully return all domains from config', function () {
    const domainConfig = config.getDomainConfig();

    expect(domainConfig).toEqual(testingConfigData.domains[0]);
  });

  it('Should throw error if provided chainId doesn\'t have configured domain', async function () {
    const expectedError = new Error("Config for the provided domain is not setup");
    await config.init(1, Environment.TESTNET);

    expect(() => config.getDomainConfig()).toThrow(expectedError);
  });

  it('Should successfully return all resources for domain', async function () {
    await config.init(1, Environment.DEVNET);
    const resources = config.getDomainResources();

    expect(resources).toEqual(testingConfigData.domains[0].resources);
  });

  it('Should successfully all supported domains from config', async function () {
    await config.init(1, Environment.DEVNET);
    const domains = config.getDomains();

    expect(domains).toEqual(testingConfigData.domains.map(({ id, name }) => ({ id, name })))
  });
});
