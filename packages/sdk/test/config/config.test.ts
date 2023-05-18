import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import { Environment } from '../../src/types/config.js';
import { Config } from '../../src/config.js';
import { testingConfigData } from '../constants.js';
import { ConfigUrl } from '../../src/constants.js';

const axiosMock = new MockAdapter(axios);

describe('Config', () => {
  let config: Config = new Config();


  beforeEach(() => {
    axiosMock.onGet(ConfigUrl.DEVNET).reply(200, testingConfigData)
    axiosMock.onGet(ConfigUrl.TESTNET).reply(200, {domains: []})
    axiosMock.onGet(ConfigUrl.MAINNET).networkError()
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it('Should successfully initialize config for the corresponding environment', async function () {
    await config.init(1, Environment.DEVNET);

    expect(config.environment).toEqual(testingConfigData);
  });

  it('Should throw error if failed to fetch config', async function () {
    const expectedError = new Error("Failed to fetch shared config because of: Network Error");

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
