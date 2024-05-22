import type { Domain, EthereumConfig, RawConfig, Resource, SubstrateConfig } from '../types/index.js';
import { Environment } from '../types/index.js';
export declare class Config {
    chainId: number;
    environment: RawConfig;
    init(chainId: number, environment: Environment): Promise<void>;
    getSourceDomainConfig(): EthereumConfig | SubstrateConfig;
    getDomainConfig(domainId: number): EthereumConfig | SubstrateConfig;
    getDomains(): Array<Domain>;
    getDomainResources(): Array<Resource>;
    getBaseTransferParams(destinationChainId: number, resourceId: string): {
        sourceDomain: Domain;
        destinationDomain: Domain;
        resource: Resource;
    };
}
//# sourceMappingURL=config.d.ts.map