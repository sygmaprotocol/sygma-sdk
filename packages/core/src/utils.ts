import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { Network as BitcoinNetwork, validate } from 'bitcoin-address-validation';
import { ethers } from 'ethers';

import { ExplorerUrl, IndexerUrl } from './constants.js';
import { getFeeHandlerAddressesOfRoutes, getFeeHandlerTypeOfRoutes } from './multicall.js';
import type {
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
  env: Environment = Environment.MAINNET,
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

export function getSygmaScanLink(sourceHash: string, environment: Environment): string {
  switch (environment) {
    case Environment.DEVNET:
    case Environment.LOCAL:
      throw new Error(`Scanner unavailable for environment: ${environment}`);
    case Environment.MAINNET:
      return `https://scan.buildwithsygma.com/transfer/${sourceHash}`;
    case Environment.TESTNET:
      return `https://scan.test.buildwithsygma.com/transfer/${sourceHash}`;
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
export async function getEnvironmentMetadata(
  environment: Environment = Environment.MAINNET,
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
 * @param {Domainlike} source Either caip2 identifier or chainId or Domain Object from SDK
 * @param {Environment} environment
 * @param {{routeTypes?: RouteType[]; sourceProvider?: Eip1193Provider;}} options Allows selecting bridge instance (mainnet by default) and filtering routes by type.
 */
export async function getRoutes(
  source: Domainlike,
  environment: Environment = Environment.MAINNET,
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
      const feeHandlerAddressesMap = await getFeeHandlerAddressesOfRoutes({
        routes: data.routes,
        chainId: domainConfig.chainId,
        bridgeAddress: domainConfig.bridge,
        provider: options.sourceProvider,
      });

      routeFeeHandlerAddressesAndTypes = await getFeeHandlerTypeOfRoutes({
        feeHandlerAddressesMap,
        routes: data.routes,
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
        routeWithTypeAndAddress = routeFeeHandlerAddressesAndTypes.find(
          _route =>
            _route.fromDomainId === route.fromDomainId &&
            _route.toDomainId === route.toDomainId &&
            _route.resourceId === route.resourceId,
        );
      }

      let feeHandler = undefined;
      if (routeWithTypeAndAddress) {
        feeHandler = {
          type: routeWithTypeAndAddress.feeHandlerType,
          address: routeWithTypeAndAddress.feeHandlerAddress,
        };
      }

      const toDomain = config.findDomainConfigBySygmaId(Number(route.toDomainId));

      return {
        fromDomain: config.getDomain(domainConfig.chainId),
        toDomain: config.getDomain(toDomain.caipId),
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
  environment: Environment = Environment.MAINNET,
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
    const [transactionData] = data;
    const { status, fromDomainId, toDomainId, sourceHash, depositNonce, destinationHash } =
      transactionData;

    return {
      status,
      fromDomainId,
      toDomainId,
      sourceHash,
      depositNonce,
      destinationHash,
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
  environment: Environment = Environment.MAINNET,
): Promise<SygmaConfig> {
  const config = new Config();
  await config.init(environment);
  const sygmaConfig = config.configuration;
  if (!sygmaConfig) {
    throw new Error(`Unable to fetch configuration for environment: ${environment}`);
  }
  return sygmaConfig;
}

/**
 * Validate Substrate address.
 * @param {string} address
 */
export function isValidSubstrateAddress(address: string): boolean {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate EVM address.
 * @param {string} address
 * @returns {boolean}
 */
export function isValidEvmAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

/**
 * Validate Bitcoin address.
 * @param {string} address
 * @returns {boolean}
 */
export function isValidBitcoinAddress(environment: Environment, address: string): boolean {
  if (environment === Environment.TESTNET || environment === Environment.DEVNET) {
    return validate(address, BitcoinNetwork.testnet);
  }

  return validate(address, BitcoinNetwork.mainnet);
}

/**
 * Validate Address based on network.
 * @param {string} address
 * @param {Network} network
 * @returns {boolean}
 */
export function isValidAddressForNetwork(
  environment: Environment,
  address: string,
  network: Network,
): boolean {
  switch (network) {
    case Network.EVM:
      if (isValidEvmAddress(address)) return true;
      throw new Error('Invalid EVM Address');
    case Network.SUBSTRATE:
      if (isValidSubstrateAddress(address)) return true;
      throw new Error('Invalid Substrate Address');
    case Network.BITCOIN:
      if (isValidBitcoinAddress(environment, address)) return true;
      throw new Error('Invalid Bitcoin Address');
    default:
      throw new Error('Provided network is not supported');
  }
}
