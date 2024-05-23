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
  configuration!: SygmaConfig;
  initialized = false;
  /**
   * Transform old config fields
   * to new ones
   * TODO: remove this method
   * @param {SygmaConfig} oldConfig 
   * @returns {SygmaConfig}
   */
  transformConfig(oldConfig: SygmaConfig): SygmaConfig {
    oldConfig.domains.forEach((domain) => {
      domain.resources.forEach((resource) => {
        if ((resource as any).resourceId) {
          resource.sygmaResourceId = (resource as any).resourceId;
        }
        if (!(resource as any).caip19) {
          (resource as any).caip19 = '';
        }
      })

      if ((domain as any).id) {
        domain.sygmaId = (domain as any).id;
      }

      if (!(domain as any).caipId) {
        domain.caipId = '';
      }
    })

    return oldConfig;
  }

  constructor() {}
  /**
   * Initialize and store all
   * sygma configurations
   */
  async init(environment: Environment): Promise<void> {
    if (environment === Environment.LOCAL) {
      this.configuration = localConfig;
    } else {
      const response = await fetch(this.getConfigUrl(environment));
      let data = (await response.json()) as SygmaConfig;
      data = this.transformConfig(data);
      this.configuration = data;
      // initialized is set to true when
      // all configurations have been fetched
      this.initialized = true;
    }
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
  findDomainConfigBySygmaId(sygmaId: number): SubstrateConfig | EthereumConfig {
    const domainConfig = this.configuration.domains.find((domain) => domain.sygmaId === sygmaId);
    if (!domainConfig) throw new Error(`Domain with sygmaId: ${sygmaId} not found.`);
    return domainConfig;
  }
  /**
   * Find configuration of the domain
   * existing in current sygma configuration
   * @param {Domainlike} domainLike
   * @returns {{ config: SubstrateConfig | EthereumConfig | undefined; environment: Environment; }}
   */
  findDomainConfig(domainLike: Domainlike): SubstrateConfig | EthereumConfig {
    const config = this.configuration.domains.find(domain => {
      switch(typeof domainLike) {
        case 'string':
          return domain.caipId === domainLike;
        case 'object':
          return domain.caipId === domainLike.caipId &&
          domain.chainId === domainLike.chainId;
        case 'number':
          return domain.chainId === domainLike;
      }

      return false;
    });

    if (!config)
    throw new Error('Domain configuration not found.');
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
  getDomainConfig(domainLike: Domainlike): SubstrateConfig | EthereumConfig {
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
  getDomains(options?: { networkTypes?: Network[]; }): Domain[] {
    if (!this.initialized) throw new Error('SDK Uninitialized');
    const config = this.configuration;
    if (!config) throw new Error('Configuration unavailable or uninitialized.');

    const domains = config.domains.filter(f => {
      if (options?.networkTypes) {
        return options?.networkTypes?.includes(f.type)
      }
      return true
    }).map(dc => this.createDomain(dc));
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
