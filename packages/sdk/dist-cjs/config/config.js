"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const index_js_1 = require("../types/index.js");
const index_js_2 = require("../index.js");
const localConfig_js_1 = require("./localConfig.js");
class Config {
    async init(chainId, environment) {
        this.chainId = chainId;
        if (environment === index_js_1.Environment.LOCAL) {
            this.environment = localConfig_js_1.localConfig;
            return;
        }
        let configUrl;
        switch (environment) {
            case index_js_1.Environment.DEVNET: {
                configUrl = index_js_2.ConfigUrl.DEVNET;
                break;
            }
            case index_js_1.Environment.TESTNET: {
                configUrl = index_js_2.ConfigUrl.TESTNET;
                break;
            }
            default:
                configUrl = index_js_2.ConfigUrl.MAINNET;
        }
        try {
            const response = await fetch(configUrl);
            this.environment = (await response.json());
        }
        catch (err) {
            if (err instanceof Error) {
                throw new Error(`Failed to fetch shared config because of: ${err.message}`);
            }
            else {
                throw new Error('Something went wrong while fetching config file');
            }
        }
    }
    getSourceDomainConfig() {
        const domain = this.environment.domains.find(domain => domain.chainId === this.chainId);
        if (!domain) {
            throw new Error('Config for the provided domain is not setup');
        }
        return domain;
    }
    getDomainConfig(domainId) {
        const domain = this.environment.domains.find(d => d.id === domainId);
        if (!domain) {
            throw new Error('Domain not found');
        }
        return domain;
    }
    getDomains() {
        return this.environment.domains.map(({ id, chainId, name, type }) => ({
            id,
            chainId,
            name,
            type,
        }));
    }
    getDomainResources() {
        const domain = this.getSourceDomainConfig();
        return domain.resources;
    }
    getBaseTransferParams(destinationChainId, resourceId) {
        const sourceDomain = this.getDomains().find(domain => domain.chainId == this.chainId);
        if (!sourceDomain) {
            throw new Error('Config for the provided destination domain is not setup');
        }
        const destinationDomain = this.getDomains().find(domain => domain.chainId == destinationChainId);
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
exports.Config = Config;
//# sourceMappingURL=config.js.map