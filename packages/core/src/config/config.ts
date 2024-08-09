import { ConfigUrl } from '../index.js';
import type {
  BitcoinConfig,
  Domain,
  Domainlike,
  EthereumConfig,
  Network,
  Resource,
  SubstrateConfig,
  SygmaConfig,
  SygmaDomainConfig,
} from '../types.js';
import { Environment } from '../types.js';

import { localConfig } from './localConfig.js';

export class Config {
  /**
   * Cache storing all sygma
   * environment configurations
   */
  configuration!: SygmaConfig;
  initialized = false;
  /**
   * Initialize and store all
   * sygma configurations
   */
  async init(environment: Environment): Promise<void> {
    if (environment === Environment.LOCAL) {
      this.configuration = localConfig;
    } else {
      const response = await fetch(this.getConfigUrl(environment));
      const config = (await response.json()) as SygmaConfig;
      this.configuration = config;
      // initialized is set to true when
      // all configurations have been fetched
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
      case Environment.DEVNET:
        return ConfigUrl.DEVNET;
      case Environment.TESTNET:
        return ConfigUrl.TESTNET;
      default:
        return ConfigUrl.MAINNET;
    }
  }
  /**
   * Creates a domain object from config object
   * @param {SygmaDomainConfig} config
   * @returns {Domain}
   */
  private createDomain(config: SygmaDomainConfig): Domain {
    return {
      id: config.id,
      caipId: config.caipId,
      chainId: config.chainId,
      name: config.name,
      type: config.type,
      parachainId: (config as SubstrateConfig).parachainId,
      feeAddress: (config as BitcoinConfig).feeAddress,
    };
  }
  /**
   * Find a domain by sygma ID
   * @note there are cases in fee processing when we have
   * to explicitly search on the basis of sygma ID
   * @param {number} sygmaId
   * @returns {SubstrateConfig | EthereumConfig}
   */
  findDomainConfigBySygmaId(sygmaId: number): SygmaDomainConfig {
    const domainConfig = this.configuration.domains.find(domain => domain.id === sygmaId);
    if (!domainConfig) throw new Error(`Domain with sygmaId: ${sygmaId} not found.`);
    return domainConfig;
  }
  /**
   * Find configuration of the domain
   * existing in current sygma configuration
   * @param {Domainlike} domainLike
   * @returns {{ config: SygmaDomainConfig | undefined; environment: Environment; }}
   */
  findDomainConfig(domainLike: Domainlike): SygmaDomainConfig {
    const config = this.configuration.domains.find(domain => {
      switch (typeof domainLike) {
        case 'string':
          return domain.caipId === domainLike;
        case 'object':
          return domain.caipId === domainLike.caipId && domain.chainId === domainLike.chainId;
        case 'number':
          return domain.chainId === domainLike;
      }
    });

    if (!config) throw new Error('Domain configuration not found.');
    return config;
  }
  /**
   * Get sygma raw bridging configuration
   * @returns {SygmaConfig}
   */
  getConfiguration(): SygmaConfig {
    return this.configuration;
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
    if (!domainConfig) throw new Error('Domain configuration not found.');
    return this.createDomain(domainConfig);
  }
  /**
   * Get domain configuration
   * @param {Domainlike} domainLike chain id, caip id or sygma id
   * @returns {SubstrateConfig | EthereumConfig}
   */
  getDomainConfig(domainLike: Domainlike): SubstrateConfig | EthereumConfig | BitcoinConfig {
    if (!this.initialized) throw new Error('SDK Uninitialized');
    const domainConfig = this.findDomainConfig(domainLike);
    if (!domainConfig) throw new Error('Domain configuration not found.');
    return domainConfig;
  }
  /**
   * Retrieves list of supported domains
   * from the configuration
   * @param {{ networkTypes?: Network[]; environment?: Environment }} options
   * @returns {Domain[]}
   */
  getDomains(options?: { networkTypes?: Network[] }): Domain[] {
    if (!this.initialized) throw new Error('SDK Uninitialized');
    const config = this.configuration;
    if (!config) throw new Error('Configuration unavailable or uninitialized.');

    const domains = config.domains
      .filter(domain => {
        if (options?.networkTypes) {
          return options?.networkTypes?.includes(domain.type);
        }
        return true;
      })
      .map(domainConfig => this.createDomain(domainConfig));
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
    return domainConfig.resources;
  }
}
