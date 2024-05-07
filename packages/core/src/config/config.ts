import type {
  Domain,
  Domainlike,
  EthereumConfig,
  Network,
  Resource,
  SubstrateConfig,
  SygmaConfig,
} from '../types.js';
import { Environment } from '../types.js';
import { ConfigUrl } from '../index.js';
import { localConfig } from './localConfig.js';

export class Config {
  private _configuration: Map<Environment, SygmaConfig>;
  public environment!: Environment;

  get configuration(): SygmaConfig {
    if (this.environment) {
      const configuration = this._configuration.get(this.environment);
      if (configuration) {
        return configuration;
      }
    }

    throw new Error('Configuration unavailable or uninitialized.');
  }

  constructor() {
    this._configuration = new Map();
    this._configuration.set(Environment.LOCAL, localConfig);
  }
  /**
   * Sets environment based on source domain specified
   * TODO: do this in init and make private
   * @param {Domainlike} sourceDomain source chain id, sygma id or caip id.
   * @returns {void}
   */
  public setEnvironment(sourceDomain: Domainlike): void {
    for (const _environment of Object.values(Environment)) {
      const config = this._configuration.get(_environment);

      if (config) {
        const domain = this.findDomainConfig(sourceDomain, config);

        if (domain) {
          this.environment = _environment;
          return;
        }
      }
    }
  }
  /**
   * Retrieve hosted bridge configuration in JSON format
   * @param {Environment} environment bridging environment i.e mainnet, testnet or devnet
   * @returns {Promise<SygmaConfig>}
   */
  private async fetchConfig(environment: Environment): Promise<SygmaConfig> {
    let configUrl;
    switch (environment) {
      case Environment.DEVNET: {
        configUrl = ConfigUrl.DEVNET;
        break;
      }
      case Environment.TESTNET: {
        configUrl = ConfigUrl.TESTNET;
        break;
      }
      default:
        configUrl = ConfigUrl.MAINNET;
    }
    const response = await fetch(configUrl);
    return (await response.json()) as SygmaConfig;
  }
  /**
   * Initializes the sdk
   * by retrieving bridge configuration JSONs
   * @param {Environment} environment bridging environment i.e mainnet, testnet or devnet
   */
  public async init(environment?: Environment): Promise<void> {
    this.environment = environment ? environment : Environment.MAINNET;

    for (const env of Object.values(Environment)) {
      try {
        if (!this._configuration.get(env)) {
          const rawConfig = await this.fetchConfig(env);
          this._configuration.set(env, rawConfig);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Failed to fetch shared config because of: ${error.message}`);
        } else {
          console.error('Something went wrong while fetching config file');
        }
      }
    }
  }
  /**
   * Get domain minimal data
   * ! throws an error if domain is not found
   * @param {Domainlike} domainlike chain id, sygma id or caip id of a supported domain
   * @returns {Domain} object containing ids, name and type
   */
  public getDomain(domainlike: Domainlike): Domain {
    const domain = this.getDomainConfig(domainlike);
    if (!domain) throw new Error('Domain not found');

    return {
      caipId: domain.caipId,
      sygmaId: domain.sygmaId,
      chainId: domain.chainId,
      name: domain.name,
      type: domain.type,
      parachainId: (domain as SubstrateConfig).parachainId,
    };
  }
  /**
   * Find a domain configuration within `SygmaConfig`,
   * internal use, priority chainId, sygmaId
   * or caipId.
   * Correct environment should be set before using the method
   * @param {Domainlike} domainLike source chain id, sygma id, caip id or domain object itself.
   * @param {SygmaConfig} config raw sygma configuration from hosted JSON
   * @returns {EthereumConfig | SubstrateConfig | undefined}
   */
  private findDomainConfig(
    domainLike: Domainlike,
    config: SygmaConfig,
  ): EthereumConfig | SubstrateConfig | undefined {
    let domainConfig = undefined;
    const domainLiketype = typeof domainLike;

    if (domainLiketype === 'object') {
      domainConfig = config.domains.find(config => {
        return config.chainId === (domainLike as Domain).chainId;
      });
    } else {
      if (domainLiketype === 'string') {
        domainLike = parseInt(domainLike as string);
      }
      domainConfig = config.domains.find(config => {
        const { chainId, sygmaId, caipId } = config;
        return chainId === domainLike || sygmaId === domainLike || caipId === domainLike;
      });
    }

    return domainConfig;
  }
  /**
   * Get domain configuration,
   * Correct environment should be set before using the method
   * ! throws Error if domain is not found
   * @param {Domainlike} {Domainlike} domainLike source chain id, sygma id, caip id or domain object itself.
   * @returns {EthereumConfig | SubstrateConfig}
   */
  public getDomainConfig(domainlike: Domainlike): EthereumConfig | SubstrateConfig {
    const domainConfig = this.findDomainConfig(domainlike, this.configuration);
    if (!domainConfig) {
      throw new Error('Config for the provided domain is not setup.');
    }
    return domainConfig;
  }

  /**
   * Get all domains available in current environment
   * Environment should be set before using this method
   * @param {{ networkTypes?: Network[] }} options list of network types required
   * @returns {Array<Domain>}
   */
  public getDomains(options?: { networkTypes?: Network[] }): Array<Domain> {
    return this.configuration.domains
      .filter(domain => {
        if (options?.networkTypes) {
          return options.networkTypes.includes(domain.type);
        }
        return true;
      })
      .map(domain => {
        const { sygmaId, caipId, chainId, name, type } = domain;

        return {
          sygmaId,
          caipId,
          chainId,
          name,
          type,
          parachainId: (domain as SubstrateConfig).parachainId,
        };
      });
  }
  /**
   * Get resources of a domain
   * ! will throw error if domain is not found
   * @param {Domainlike} domain chain id, caip id, sygma id or domain object itself
   * @returns {Array<Resource>} resources list
   */
  public getDomainResources(domain: Domainlike): Array<Resource> {
    const d = this.getDomainConfig(domain);
    return d.resources;
  }
}
