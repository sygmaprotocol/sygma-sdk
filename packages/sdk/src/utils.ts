import axios from 'axios';
import { Config } from '../types/index.js';
import type { EnvironmentMetadata } from './constants.js';
import { DomainMetadataConfig, ExplorerUrl, IndexerUrl } from './constants.js';
import type {
  Route,
  RouteIndexerType,
  TransferStatus,
  TransferStatusResponse,
} from './types/index.js';
import { Environment } from './types/index.js';

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
export function getEnvironmentMetadata(environment: Environment): EnvironmentMetadata {
  const domainMetadata = DomainMetadataConfig[environment];
  if (!domainMetadata) throw new Error('Provided environment does not have defined metadata');
  return domainMetadata;
}

export async function getRoutes(
  environment: Environment,
  sourceChainId: number,
  type: string,
): Promise<Route[]> {
  let indexerUrl: string;
  if (environment === Environment.TESTNET) {
    indexerUrl = IndexerUrl.TESTNET;
  } else if (environment === Environment.MAINNET) {
    indexerUrl = IndexerUrl.MAINNET;
  } else {
    throw new Error('Invalid environment');
  }

  const config = new Config();
  await config.init(sourceChainId, environment);
  const url = `${indexerUrl}/api/routes/from/${config.getSourceDomainConfig().id}?resourceType=${type}`;

  try {
    const response = await axios.get<{ routes: RouteIndexerType[] }>(url);
    return response.data.routes.map(value => mapToRoute(value, config));
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch shared config because of: ${err.message}`);
    } else {
      throw new Error('Something went wrong while fetching config file');
    }
  }
}

function mapToRoute(route: RouteIndexerType, config: Config): Route {
  const resource = config.getDomainResources().find(r => r.resourceId === route.resourceId)!;
  return {
    fromDomain: config.getSourceDomainConfig(),
    toDomain: config.getDomainConfig(Number(route.toDomainId)),
    resource: resource,
  };
}
