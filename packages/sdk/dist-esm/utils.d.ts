import type { EnvironmentMetadata, Route, TransferStatusResponse } from './types/index.js';
import { Environment } from './types/index.js';
/**
 * @@description Get the status of a transfer using transaction hash and optionally domain id
 */
export declare function getTransferStatusData(environment: Environment, txHash: string): Promise<TransferStatusResponse[]>;
export declare function getTransferStatusData(environment: Environment, txHash: string, domainId: string): Promise<TransferStatusResponse>;
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
export declare function getEnvironmentMetadata(environment: Environment): Promise<EnvironmentMetadata>;
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
export declare function getRoutes(environment: Environment, sourceChainId: number, type?: 'fungible' | 'gmp'): Promise<Route[]>;
//# sourceMappingURL=utils.d.ts.map