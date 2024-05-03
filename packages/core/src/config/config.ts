import type {
  Domain,
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

    throw new Error('Configuration unavailable on uninitialized.');
  }

  constructor() {
    this._configuration = new Map();
    this._configuration.set(Environment.LOCAL, localConfig);
  }

  public setEnvironment(sourceDomain: number | string | Domain): void {
    for (const _environment of Object.values(Environment)) {
      this.environment = _environment;
      const domainConfig = this.getDomainConfig(sourceDomain);
      if (domainConfig) {
        return;
      }
    }

    throw new Error('Specified source domain not configured');
  }

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

  public getDomain(domainish: number | string | Domain): Domain {
    const domain = this.getDomainConfig(domainish);
    if (!domain) throw new Error('Domain not found');

    return {
      caipId: domain.caipId,
      sygmaId: domain.sygmaId,
      chainId: domain.chainId,
      name: domain.name,
      type: domain.type,
    };
  }

  public getDomainConfig(domain: number | string | Domain): EthereumConfig | SubstrateConfig {
    let domainConfig;
    if (typeof domain === 'object') {
      domainConfig = this.configuration.domains.find(config => {
        return config.chainId === (domain as Domain).chainId;
      });
    } else {
      if (typeof domain === 'string') {
        domain = parseInt(domain);
      }
      domainConfig = this.configuration.domains.find(config => {
        return config.chainId === domain || config.caipId === domain || config.sygmaId === domain;
      });
    }

    if (!domainConfig) {
      throw new Error('Domain not found');
    }

    return domainConfig;
  }

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

  public getDomainResources(_domain: string | number | Domain): Array<Resource> {
    const domain = this.getDomainConfig(_domain);
    return domain ? domain.resources : [];
  }

  public getBaseTransferParams(
    source: number | string | Domain,
    destinationChainId: number,
    resourceId: string,
  ): { sourceDomain: Domain; destinationDomain: Domain; resource: Resource } {
    const sourceDomain = this.getDomainConfig(source);

    if (!sourceDomain) {
      throw new Error('Config for the provided destination domain is not setup');
    }

    const destinationDomain = this.getDomains().find(
      domain => domain.chainId == destinationChainId,
    );
    if (!destinationDomain) {
      throw new Error('Config for the provided destination domain is not setup');
    }

    const resource = sourceDomain.resources.find(
      resource => resource.sygmaResourceId == resourceId,
    );
    if (!resource) {
      throw new Error('Config for the provided resource is not setup');
    }

    return {
      sourceDomain,
      destinationDomain,
      resource,
    };
  }
}
