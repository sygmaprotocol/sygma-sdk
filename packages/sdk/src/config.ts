import axios from 'axios';
import { localConfig } from './localConfig';
import {
  Environment,
  RawConfig,
  Domain,
  EthereumConfig,
  SubstrateConfig,
  Resource,
} from './types/index.js';
import { ConfigUrl } from './index.js';

export class Config {
  public chainId!: number;
  public environment!: RawConfig;

  public async init(chainId: number, environment: Environment): Promise<void> {
    this.chainId = chainId;
    if (environment === Environment.LOCAL) {
      this.environment = localConfig;
      return;
    }

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
      case Environment.TESTNET_X: {
        configUrl = ConfigUrl.TESTNET_X;
        break;
      }
      default:
        configUrl = ConfigUrl.MAINNET;
    }

    try {
      const response = await axios.get(configUrl);
      this.environment = response.data as unknown as RawConfig;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to fetch shared config because of: ${err.message}`);
      } else {
        throw new Error('Something went wrong while fetching config file');
      }
    }
  }

  public getDomainConfig(): EthereumConfig | SubstrateConfig {
    const domain = this.environment.domains.find(domain => domain.chainId === this.chainId);
    if (!domain) {
      throw new Error('Config for the provided domain is not setup');
    }
    return domain;
  }

  public getDomains(): Array<Domain> {
    return this.environment.domains.map(({ id, chainId, name }) => ({ id, chainId, name }));
  }

  public getDomainResources(): Array<Resource> {
    const domain = this.getDomainConfig();
    return domain.resources;
  }

  public getBaseTransferParams(
    destinationChainId: number,
    resourceId: string,
  ): { sourceDomain: Domain; destinationDomain: Domain; resource: Resource } {
    const sourceDomain = this.getDomains().find(domain => domain.chainId == this.chainId);

    if (!sourceDomain) {
      throw new Error('Config for the provided destination domain is not setup');
    }

    const destinationDomain = this.getDomains().find(
      domain => domain.chainId == destinationChainId,
    );
    if (!destinationDomain) {
      throw new Error('Config for the provided destination domain is not setup');
    }

    const resource = this.getDomainResources().find(resource => resource.resourceId == resourceId);
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
