import { ExplorerUrl, IndexerUrl } from './constants.js';
import type {
  Route,
  TransferStatus,
  TransferStatusResponse,
  RouteIndexerType,
  EnvironmentMetadata,
  Domain,
  Network,
  RouteType,
  SygmaConfig,
} from './types.js';
import { Environment } from './types.js';
import { Config } from './index.js';

const config = new Config();

function getIndexerTransferUrl(
  env: Environment,
  txHash: string,
): {
  explorerUrl: string;
  url: string;
} {
  let url = '';
  let explorerUrl = '';

  switch (env) {
    case Environment.TESTNET:
      url = `${IndexerUrl.TESTNET}/api/transfers/txHash/${txHash}`;
      explorerUrl = `${ExplorerUrl.TESTNET}/transfer/${txHash}`;
      break;
    case Environment.MAINNET:
      url = `${IndexerUrl.MAINNET}/api/transfers/txHash/${txHash}`;
      explorerUrl = `${ExplorerUrl.MAINNET}/transfer/${txHash}`;
      break;
    case Environment.LOCAL:
    case Environment.DEVNET:
      throw new Error('Invalid Environment');
  }

  return { url, explorerUrl };
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
    const response = await fetch(url);
    return (await response.json()) as EnvironmentMetadata;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch env metadata because of: ${err.message}`);
    } else {
      throw new Error('Something went wrong while fetching env metadata');
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

/**
 * Returns all Sygma supported domains (networks).
 * By default it will fetch domains configured for mainnet bridge deployment.
 * Alternative option can be specified in options.env.
 * You can filter domains with specifity types or ones that have at least one outbound route of specified type.
 */
export async function getDomains(options?: {
  routeTypes?: RouteType[];
  env?: Environment;
  networkTypes?: Network[];
}): Promise<Domain[]> {
  await config.init(options?.env);
  const domains = config.getDomains(options);
  return domains;
}

/**
 * Returns  supported routes originating from given source domain.
 * @param source Either caip2 identifier, chainId or sygmaId
 * @param options Allows selecting bridge instance (mainnet by default) and filtering routes by type.
 */
export async function getRoutes(
  source: string | number | Domain,
  options?: {
    env: Environment;
    routeTypes?: RouteType[];
  },
): Promise<Route[]> {
  try {
    await config.init(options?.env);

    const domain = config.getDomainConfig(source);
    if (!domain) {
      throw new Error('Domain not supported or incorrect environment set');
    }

    const indexerUrl = getIndexerURL(options?.env ?? config.environment);
    const typeQuery = options?.routeTypes ? `?resourceType=${options.routeTypes.join(',')}` : '';
    const url = `${indexerUrl}/api/routes/from/${domain.sygmaId}${typeQuery}`;

    const response = await fetch(url);
    const data = (await response.json()) as { routes: RouteIndexerType[] };

    return data.routes
      .filter(route => {
        if (options?.routeTypes) {
          return options.routeTypes.includes(route.type);
        }
        return true;
      })
      .map(route => {
        const resource = domain.resources.find(r => r.sygmaResourceId === route.sygmaResourceId)!;
        return {
          fromDomain: config.getDomain(domain.sygmaId),
          toDomain: config.getDomain(Number(route.toDomainId)),
          resource: resource,
          feeHandler: route.feeHandler,
        };
      });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch routes because of: ${err.message}`);
    } else {
      throw new Error('Something went wrong while fetching routes');
    }
  }
}

/**
 * TODO: why isn't txHash unique identifier
 * @param txHash
 */
export async function getTransferStatus(txHash: string): Promise<TransferStatusResponse> {
  const { url, explorerUrl } = getIndexerTransferUrl(config.environment, txHash);

  try {
    const response = await fetch(url);
    const data = (await response.json()) as (Record<string, unknown> & {
      status: TransferStatus;
      toDomainId: number;
      fromDomainId: number;
      sourceHash: string;
      destinationHash: string;
      depositNonce: number;
    })[];

    if (!data.length) throw new Error(`Record for ${txHash} not found`);

    return {
      status: data[0].status,
      fromDomainId: data[0].fromDomainId,
      toDomainId: data[0].toDomainId,
      sourceHash: data[0].sourceHash,
      depositNonce: data[0].depositNonce,
      destinationHash: data[0].destinationHash,
      explorerUrl,
    };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to fetch transfer status because of: ${err.message}`);
    } else {
      throw new Error('Something went wrong while fetching transfer status');
    }
  }
}

/**
 * End users shouldn't really need that but lets expose for power users
 * @param env
 */
export async function getRawConfiguration(env: Environment): Promise<SygmaConfig> {
  await config.init(env);
  const sygmaConfig = config.configuration;
  if (!sygmaConfig) {
    throw new Error(`Unable to fetch configuration for environment: ${env}`);
  }
  return sygmaConfig;
}
