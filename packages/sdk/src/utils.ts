import axios from 'axios';
import { Config } from '../types/index.js';
import { ExplorerUrl, IndexerUrl } from './constants.js';
import type {
  EnvironmentMetadata,
  Route,
  RouteIndexerType,
  TransferStatus,
  TransferStatusResponse,
} from './types/index.js';
import { Environment } from './types/index.js';

export const DEVNET_FEE_ORACLE_BASE_URL: string = 'https://fee-oracle.develop.buildwithsygma.com/';
export const TESTNET_FEE_ORACLE_BASE_URL: string = 'https://fee-oracle.test.buildwithsygma.com/';
export const MAINNET_FEE_ORACLE_BASE_URL: string = '';

export function getFeeOracleBaseURL(environment?: Environment): string {
  switch (environment) {
    case Environment.DEVNET:
      return DEVNET_FEE_ORACLE_BASE_URL;
    case Environment.TESTNET:
      return TESTNET_FEE_ORACLE_BASE_URL;
    case Environment.MAINNET:
    default:
      return MAINNET_FEE_ORACLE_BASE_URL;
  }
}

/**
 * @@description Get the status of a transfer using transaction hash and optionally domain id
 */
export async function getTransferStatusData(
  environment: Environment,
  txHash: string,
  domainId?: string,
): Promise<TransferStatusResponse> {
  let url: string;
  let explorerUrl: string;

  if (environment === Environment.TESTNET) {
    url = `${IndexerUrl.TESTNET}/api/transfers/txHash/${txHash}${
      domainId ? `?domainId=${domainId}` : ''
    }`;
    explorerUrl = `${ExplorerUrl.TESTNET}/transfer/${txHash}`;
  } else if (environment === Environment.MAINNET) {
    url = `${IndexerUrl.MAINNET}/api/transfers/txHash/${txHash}${
      domainId ? `?domainId=${domainId}` : ''
    }`;
    explorerUrl = `${ExplorerUrl.MAINNET}/transfer/${txHash}`;
  } else {
    throw new Error('Invalid environment');
  }

  const response = await fetch(url);
  const data = (await response.json()) as Record<string, unknown> & { status: TransferStatus };
  return {
    status: data.status,
    explorerUrl,
  };
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
export async function getEnvironmentMetadata(
  environment: Environment,
): Promise<EnvironmentMetadata> {
  try {
    const url = `${getIndexerURL(environment)}/api/domains/metadata`;
    const response = await axios.get<EnvironmentMetadata>(url);
    return response.data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch env metadata because of: ${err.message}`);
    } else {
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
export async function getRoutes(
  environment: Environment,
  sourceChainId: number,
  type: 'fungible' | 'gmp' | 'all',
): Promise<Route[]> {
  try {
    const config = new Config();
    await config.init(sourceChainId, environment);

    const indexerUrl = getIndexerURL(environment);
    const url = `${indexerUrl}/api/routes/from/${config.getSourceDomainConfig().id}?resourceType=${type}`;

    const response = await axios.get<{ routes: RouteIndexerType[] }>(url);
    return response.data.routes.map(route => {
      const resource = config.getDomainResources().find(r => r.resourceId === route.resourceId)!;
      return {
        fromDomain: config.getSourceDomainConfig(),
        toDomain: config.getDomainConfig(Number(route.toDomainId)),
        resource: resource,
      };
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch shared config because of: ${err.message}`);
    } else {
      throw new Error('Something went wrong while fetching config file');
    }
  }
}

function getIndexerURL(environment: Environment): string {
  if (environment === Environment.TESTNET) {
    return IndexerUrl.TESTNET;
  } else if (environment === Environment.MAINNET) {
    return IndexerUrl.MAINNET;
  } else {
    throw new Error('Invalid environment');
  }
}
