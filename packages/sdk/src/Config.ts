import { BaseProvider } from '@ethersproject/providers';
import fetch from 'node-fetch';
import {
  Environment,
  RawConfig,
  Domain,
  EthereumConfig,
  SubstrateConfig,
  Resource,
} from './types/config';
import { ConfigUrl } from '.';

export class Config {
  public environment!: RawConfig;
  public provider!: BaseProvider;

  public async init(chainId: number, environment?: Environment): Promise<void> {
    this.provider = new BaseProvider(chainId);

    let network;
    switch (environment) {
      case Environment.DEVNET: {
        network = ConfigUrl.DEVNET;
        break;
      }
      case Environment.TESTNET: {
        network = ConfigUrl.TESTNET;
        break;
      }
      default:
        network = ConfigUrl.MAINNET;
    }

    try {
      const response = await fetch(network);
      this.environment = (await response.json()) as RawConfig;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to fetch shared config because of: ${err.message}`);
      } else {
        throw new Error('Something went wrong while fetching config file');
      }
    }
  }

  public getDomainConfig(): EthereumConfig | SubstrateConfig {
    const domain = this.environment.domains.find(
      domain => domain.chainId === this.provider.network.chainId,
    );
    return domain!;
  }

  public getDomain(): Domain {
    const domain = this.getDomainConfig();
    return {
      id: domain.chainId,
      name: domain.name,
    }!;
  }

  public getDomainResources(): Array<Resource> {
    const domain = this.getDomainConfig();
    return domain.resources;
  }
}
