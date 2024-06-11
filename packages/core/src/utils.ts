import { ExplorerUrl, IndexerUrl } from './constants.js';
import { getFeeHandlerAddressesOfRoutes, getFeeHandlerTypeOfRoutes } from './multicall.js';
import {
  Domain,
  Domainlike,
  Eip1193Provider,
  EnvironmentMetadata,
  FeeHandlerType,
  IndexerRoutesResponse,
  Route,
  RouteIndexerType,
  RouteType,
  SygmaConfig,
  TransferStatus,
  TransferStatusResponse,
} from './types.js';
import { Environment, Network } from './types.js';

import { Config } from './index.js';

function getIndexerTransferUrl(
  env: Environment = process.env.SYGMA_ENV as Environment,
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
  environment: Environment = process.env.SYGMA_ENV as Environment,
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
export async function getDomains(options: {
  routeTypes?: RouteType[];
  environment: Environment;
  networkTypes?: Network[];
}): Promise<Domain[]> {
  const config = new Config();
  await config.init(options.environment);
  const domains = config.getDomains(options);
  return domains;
}

/**
 * Returns  supported routes originating from given source domain.
 * @param source Either caip2 identifier, chainId or sygmaId
 * @param environment
 * @param options Allows selecting bridge instance (mainnet by default) and filtering routes by type.
 */
export async function getRoutes(
  source: Domainlike,
  environment: Environment = process.env.SYGMA_ENV as Environment,
  options?: {
    routeTypes?: RouteType[];
    sourceProvider?: Eip1193Provider;
  },
): Promise<Route[]> {
  try {
    const config = new Config();
    await config.init(environment);
    const domainConfig = config.findDomainConfig(source);
    const indexerUrl = getIndexerURL(environment);
    const typeQuery = options?.routeTypes ? `?resourceType=${options.routeTypes.join(',')}` : '';
    const url = `${indexerUrl}/api/routes/from/${domainConfig.id}${typeQuery}`;
    const response = await fetch(url);
    const data = (await response.json()) as IndexerRoutesResponse;

    let routeFeeHandlerAddressesAndTypes: Array<
      RouteIndexerType & { feeHandlerAddress: string } & { feeHandlerType: FeeHandlerType }
    >;

    if (domainConfig.type === Network.EVM && options?.sourceProvider) {
      const routesWithHandlerAddresses = await getFeeHandlerAddressesOfRoutes({
        routes: data.routes,
        chainId: domainConfig.chainId,
        bridgeAddress: domainConfig.bridge,
        provider: options.sourceProvider,
      });

      routeFeeHandlerAddressesAndTypes = await getFeeHandlerTypeOfRoutes({
        routes: routesWithHandlerAddresses,
        chainId: domainConfig.chainId,
        provider: options.sourceProvider,
      });
    }

    return data.routes.map(route => {
      const resource = domainConfig.resources.find(
        resource => resource.resourceId === route.resourceId,
      )!;

      let routeWithTypeAndAddress;
      if (routeFeeHandlerAddressesAndTypes) {
        routeWithTypeAndAddress = routeFeeHandlerAddressesAndTypes.find(_route => {
          _route.fromDomainId === route.fromDomainId &&
            _route.toDomainId === route.toDomainId &&
            _route.resourceId === route.resourceId;
        });
      }

      let feeHandler = undefined;
      if (routeWithTypeAndAddress) {
        feeHandler = {
          type: routeWithTypeAndAddress.feeHandlerType,
          address: routeWithTypeAndAddress.feeHandlerAddress,
        };
      }

      return {
        fromDomain: config.getDomain(domainConfig.chainId),
        toDomain: config.findDomainConfigBySygmaId(Number(route.toDomainId)),
        resource: resource,
        feeHandler,
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
 * @param environment
 */
export async function getTransferStatus(
  txHash: string,
  environment: Environment = process.env.SYGMA_ENV as Environment,
): Promise<TransferStatusResponse> {
  const env = environment ?? Environment.MAINNET;
  const { url, explorerUrl } = getIndexerTransferUrl(env, txHash);

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
 * @param environment
 */
export async function getRawConfiguration(
  environment: Environment = process.env.SYGMA_ENV as Environment,
): Promise<SygmaConfig> {
  const config = new Config();
  await config.init(environment);
  const sygmaConfig = config.configuration;
  if (!sygmaConfig) {
    throw new Error(`Unable to fetch configuration for environment: ${environment}`);
  }
  return sygmaConfig;
}
