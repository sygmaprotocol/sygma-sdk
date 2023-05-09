import { BaseProvider } from '@ethersproject/providers';
import { Environment, ConfigDomains, EthereumConfig, SubstrateConfig, Resource } from './types';

export class Config {
  private devnetConfigUrl = 'https://config.develop.buildwithsygma.com/share/';
  private testnetConfigUrl = 'https://config-server.test.buildwithsygma.com/share/';
  private mainnetConfigUrl = '';

  public environment!: ConfigDomains;
  public provider!: BaseProvider;

  public async init(environment: Environment, provider: BaseProvider): Promise<void> {
    this.provider = provider;

    let network;
    switch (environment) {
      case Environment.DEVNET: {
        network = this.devnetConfigUrl;
        break;
      }
      case Environment.TESTNET: {
        network = this.testnetConfigUrl;
        break;
      }
      default:
        network = this.mainnetConfigUrl;
    }

    try {
      const response = await fetch(network);
      this.environment = (await response.json()) as unknown as ConfigDomains;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to fetch shared config because of: ${err.message}`);
      } else {
        throw new Error('Failed to fetch shared config');
      }
    }
  }

  /*
  public getDomains(): Array<Domain> {
    return this.environment.domains;
  }
  */

  public getDomainResources(): Array<Resource> {
    const domain = this.environment.domains.find(
      domain => domain.chainId === this.provider.network.chainId,
    );
    return domain!.resources;
  }

  public getDomainConfig(): EthereumConfig | SubstrateConfig {
    const config = this.environment.domains.find(domain => domain.name === 'moonbeam');
    return config!;
  }
}
