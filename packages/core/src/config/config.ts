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
  /**
   * Cache storing all sygma
   * environment configurations
   */
  configuration = new Map<Environment, SygmaConfig>();
  initialized = false;

  constructor() {
    this.configuration = new Map();
    this.configuration.set(Environment.LOCAL, localConfig);
  }
  /**
   * Initialize and store all
   * sygma configurations
   */
  async init(): Promise<void> {
    for (const environment of Object.values(Environment)) {
      const exists = this.configuration.has(environment);

      if (!exists && environment !== Environment.LOCAL) {
        try {
          const response = await fetch(this.getConfigUrl(environment));
          const data = (await response.json()) as SygmaConfig;
          this.configuration.set(environment, data);
        } catch (error) {
          return Promise.reject(error);
        }
      }
    }

    this.initialized = true;
  }
  /**
   * Retrieve hosted bridge configuration in JSON format
   * @param {Environment} environment bridging environment i.e mainnet, testnet or devnet
   * @returns {Promise<SygmaConfig>}
   */
  private getConfigUrl(environment: Environment): string {
    switch (environment) {
      case Environment.DEVNET: {
        return ConfigUrl.DEVNET;
      }
      case Environment.TESTNET: {
        return ConfigUrl.TESTNET;
      }
      default:
        return ConfigUrl.MAINNET;
    }
  }
  /**
   * Creates a domain object from config object
   * @param {EthereumConfig | SubstrateConfig} config
   * @returns {Domain}
   */
  private createDomain(config: EthereumConfig | SubstrateConfig): Domain {
    return {
      sygmaId: config.sygmaId,
      caipId: config.caipId,
      chainId: config.chainId,
      name: config.name,
      type: config.type,
      parachainId: (config as SubstrateConfig).parachainId,
    };
  }
  /**
   * Find configuration of the domain
   * existing in current sygma configuration
   * @param {Domainlike} domainLike
   * @returns {SubstrateConfig | EthereumConfig | undefined}
   */
  findDomainConfig(domainLike: Domainlike): {
    config: SubstrateConfig | EthereumConfig;
    environment: Environment;
  } {
    const findOptions = {
      chainId: 0,
      sygmaId: 0,
      caipId: 0,
    };

    if (typeof domainLike === 'object') {
      findOptions.chainId = domainLike.chainId;
      findOptions.sygmaId = domainLike.sygmaId;
      findOptions.caipId = domainLike.caipId;
    } else {
      const id = typeof domainLike === 'string' ? parseInt(domainLike) : domainLike;
      findOptions.chainId = id;
      findOptions.sygmaId = id;
      findOptions.caipId = id;
    }

    for (const environment of Object.values(Environment)) {
      const environmentConfiguration = this.configuration.get(environment);

      if (environmentConfiguration) {
        const config = environmentConfiguration.domains.find(domain => {
          return (
            domain.chainId === findOptions.chainId ||
            domain.sygmaId === findOptions.sygmaId ||
            domain.caipId === findOptions.caipId
          );
        });

        if (config) {
          return { config, environment };
        }
      }
    }

    throw new Error('Domain configuration not found.');
  }
  /**
   * Get sygma raw bridging configuration
   * @param {Environment} environment
   * @returns {SygmaConfig}
   */
  getConfiguration(environment: Environment): SygmaConfig {
    const configuration = this.configuration.get(environment);
    if (configuration) {
      return configuration;
    }

    throw new Error('Configuration unavailable or uninitialized.');
  }
  /**
   * Retrieves domain from configuration
   * w.r.t chainId, sygmaId or caipId
   * @param {Domainlike} domainLike
   * @returns {Domain}
   */
  getDomain(domainLike: Domainlike): Domain {
    if (!this.initialized) throw new Error('SDK Uninitialized');
    const domainConfig = this.findDomainConfig(domainLike);
    if (!domainConfig) throw new Error('Domain not found.');
    return this.createDomain(domainConfig.config);
  }
  getDomainConfig(domainLike: Domainlike): SubstrateConfig | EthereumConfig {
    if (!this.initialized) throw new Error('SDK Uninitialized');
    const domainConfig = this.findDomainConfig(domainLike);
    if (!domainConfig) throw new Error('Domain not found.');
    return domainConfig.config;
  }
  /**
   * Retrieves list of supported domains
   * from the configuration
   * @param {{ networkTypes?: Network[]; environment?: Environment }} options
   * @returns {Domain[]}
   */
  getDomains(options?: { networkTypes?: Network[]; environment?: Environment }): Domain[] {
    if (!this.initialized) throw new Error('SDK Uninitialized');
    const environment = options?.environment ?? Environment.MAINNET;
    const config = this.configuration.get(environment);
    if (!config) throw new Error('Configuration unavailable or uninitialized.');

    const domains = config.domains.map(dc => this.createDomain(dc));
    return domains;
  }
  /**
   * Get list of resources of a particular domain
   * @param {Domainlike} domainLike chainId, sygmaId or caipId of a network
   * @returns {Resource[]}
   */
  getResources(domainLike: Domainlike): Resource[] {
    const domainConfig = this.findDomainConfig(domainLike);
    if (!domainConfig) throw new Error('Domain configuration not found.');
    return domainConfig.config.resources;
  }
}
