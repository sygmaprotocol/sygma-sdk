/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */

export enum RouteType {
  GMP = "gmp",
  FUNGIBLE = "fungible",
}

export enum Environment {
  LOCAL = "local",
  DEVNET = "devnet",
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export enum FeeHandlerType {
  BASIC = "basic",
  PERCENTAGE = "percentage",
  UNDEFINED = "undefined",
}

export enum Network {
  EVM = "evm",
  SUBSTRATE = "substrate",
}

export type Domain = {
  sygmaId: number;
  // https://chainagnostic.org/CAIPs/caip-2
  caipId: string;
  chainId: number;
  name: string;
  iconUrl?: string;
  type: Network;
};

export type Resource = EvmResource | SubstrateResource;

export enum ResourceType {
  FUNGIBLE = "fungible",
  NON_FUNGIBLE = "nonfungible",
  PERMISSIONED_GENERIC = "permissionedGeneric",
  PERMISSIONLESS_GENERIC = "permissionlessGeneric",
}

interface BaseResource {
  sygmaResourceId: string;
  // https://chainagnostic.org/CAIPs/caip-19
  caip19: string;
  type: ResourceType;
  iconUrl?: string;
  native?: boolean;
  burnable?: boolean;
  symbol?: string;
  decimals?: number;
}

export type EvmResource = BaseResource & {
  address: string;
};

export type XcmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior:
      | "here"
      | {
          x3: Array<{ parachain: number } | { generalKey: [number, string] }>; // This is a tuple of length and value
        };
  };
};

export type SubstrateResource = BaseResource & {
  assetID?: number;
  assetName: string;
  xcmMultiAssetId: XcmMultiAssetIdType;
};

export type Route = {
  fromDomain: Domain;
  toDomain: Domain;
  resource: Resource;
  feeHandler: FeeHandler;
};

export type TransferStatus = "pending" | "executed" | "failed";

export type TransferStatusResponse = {
  status: TransferStatus;
  explorerUrl: string;
  fromDomainId: number;
  toDomainId: number;
};

export interface BaseConfig<T> {
  id: number;
  chainId: number;
  name: string;
  type: T;
  bridge: string;
  nativeTokenSymbol: string;
  nativeTokenFullName: string;
  nativeTokenDecimals: bigint;
  startBlock: bigint;
  blockConfirmations: number;
  resources: Array<Resource>;
}

export type FeeHandler = {
  type: FeeHandlerType;
  address: string;
};

export interface EthereumConfig extends BaseConfig<Network.EVM> {
  handlers: Array<Handler>;
  feeRouter: string;
  feeHandlers: Array<FeeHandler>;
}

export interface SubstrateConfig extends BaseConfig<Network.SUBSTRATE> {
  handlers: Array<Handler>;
}

export type Handler = {
  type: ResourceType;
  address: string;
};

export interface RawConfig {
  domains: Array<EthereumConfig | SubstrateConfig>;
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
  throw new Error("Not implemented");
}

/**
 * Returns  supported routes originating from given source domain.
 * @param source Either caip2 identifier, chainId or sygmaId
 * @param options Allows selecting bridge instance (mainnet by default) and filtering routes by type.
 */
export async function getRoutes(
  source: string | number | Domain,
  options?: {
    env?: Environment;
    routeTypes?: RouteType[];
  },
): Promise<Route[]> {
  throw new Error("Not implemented");
}

/**
 * TODO: why isn't txHash unique identifier
 * @param txHash
 */
export async function getTransferStatus(
  txHash: string,
): Promise<TransferStatusResponse> {
  throw new Error("Not implemented");
}

/**
 * End users shouldn't really need that but lets expose for power users
 * @param env
 */
export async function getRawConfiguration(
  env: Environment,
): Promise<RawConfig> {
  throw new Error("Not implemented");
}