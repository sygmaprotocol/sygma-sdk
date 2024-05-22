import { ExplorerUrl, IndexerUrl } from './constants.js';
import { Environment } from './types/index.js';
import { Config } from './index.js';
export async function getTransferStatusData(environment, txHash, domainId) {
    let url;
    let explorerUrl;
    if (environment === Environment.TESTNET) {
        url = `${IndexerUrl.TESTNET}/api/transfers/txHash/${txHash}`;
        explorerUrl = `${ExplorerUrl.TESTNET}/transfer/${txHash}`;
    }
    else if (environment === Environment.MAINNET) {
        url = `${IndexerUrl.MAINNET}/api/transfers/txHash/${txHash}`;
        explorerUrl = `${ExplorerUrl.MAINNET}/transfer/${txHash}`;
    }
    else {
        throw new Error('Invalid environment');
    }
    try {
        const response = await fetch(url);
        const data = (await response.json());
        if (domainId) {
            const record = data.find(data => data.toDomainId === Number(domainId));
            if (!record)
                throw new Error(`Transfer with txHash: ${txHash} for domain id: ${domainId} not found.`);
            return {
                status: record.status,
                fromDomainId: record.fromDomainId,
                toDomainId: record.toDomainId,
                explorerUrl,
            };
        }
        return data.map(record => ({
            status: record.status,
            fromDomainId: record.fromDomainId,
            toDomainId: record.toDomainId,
            explorerUrl,
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            throw new Error(`Failed to fetch transfer status because of: ${err.message}`);
        }
        else {
            throw new Error('Something went wrong while fetching transfer status');
        }
    }
}
/**
 * Retrieves the environment metadata
 *
 * This function accepts an environment from the `Environment` enum as its parameter and returns the corresponding environment metadata.
 * If the specified environment does not have associated metadata in `EnvironmentMetadataConfig`, the function throws an error.
 *
 * @param environment - The environment key from the `Environment` enum.
 *
 * @returns {EnvironmentMetadata} An object mapping domain IDs to {DomainMetadata}.
 *
 * @throws {Error} Throws an error if the environment does not have defined metadata.
 *
 */
export async function getEnvironmentMetadata(environment) {
    try {
        const url = `${getIndexerURL(environment)}/api/domains/metadata`;
        const response = await fetch(url);
        return (await response.json());
    }
    catch (err) {
        if (err instanceof Error) {
            throw new Error(`Failed to fetch env metadata because of: ${err.message}`);
        }
        else {
            throw new Error('Something went wrong while fetching env metadata');
        }
    }
}
/**
 * Fetches route information based on the source chain ID and resource type.
 *
 * This function queries the configured indexer URL based on the specified environment (TESTNET or MAINNET)
 * to retrieve route data.
 *
 * @param {Environment} environment - The Sygma environment to use (TESTNET or MAINNET).
 * @param {number} sourceChainId - The ID of the source chain from which routes are being fetched.
 * @param {'fungible' | 'gmp' | 'all'} type - The type of the resource for which routes are being fetched. Can be 'fungible', 'gmp', or 'all'.
 * @returns {Promise<Route[]>} A promise that resolves to an array of Route objects, each representing a route from the source domain to a target domain for a specific resource.
 * @throws {Error} Throws an error if an invalid environment is specified, if there's a network or server issue during the fetch operation, or if the fetched data cannot be processed correctly.
 */
export async function getRoutes(environment, sourceChainId, type) {
    try {
        const config = new Config();
        await config.init(sourceChainId, environment);
        const indexerUrl = getIndexerURL(environment);
        const typeQuery = type ? `?resourceType=${type}` : '';
        const url = `${indexerUrl}/api/routes/from/${config.getSourceDomainConfig().id}${typeQuery}`;
        const response = await fetch(url);
        const data = (await response.json());
        return data.routes.map(route => {
            const resource = config.getDomainResources().find(r => r.resourceId === route.resourceId);
            return {
                fromDomain: config.getSourceDomainConfig(),
                toDomain: config.getDomainConfig(Number(route.toDomainId)),
                resource: resource,
            };
        });
    }
    catch (err) {
        if (err instanceof Error) {
            throw new Error(`Failed to fetch routes because of: ${err.message}`);
        }
        else {
            throw new Error('Something went wrong while fetching routes');
        }
    }
}
function getIndexerURL(environment) {
    if (environment === Environment.TESTNET) {
        return IndexerUrl.TESTNET;
    }
    else if (environment === Environment.MAINNET) {
        return IndexerUrl.MAINNET;
    }
    else {
        throw new Error('Invalid environment');
    }
}
//# sourceMappingURL=utils.js.map