export type ParachainId = number;

export enum RouteType {
  GMP = 'gmp',
  FUNGIBLE = 'fungible',
}

export enum Environment {
  LOCAL = 'local',
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export enum Network {
  EVM = 'evm',
  SUBSTRATE = 'substrate',
  BITCOIN = 'bitcoin',
}

export enum SecurityModel {
  MPC = 'mpc',
}

export type Domain = {
  id: number;
  // https://chainagnostic.org/CAIPs/caip-2
  caipId: string;
  chainId: number;
  name: string;
  iconUrl?: string;
  type: Network;
  parachainId?: ParachainId;
  feeAddress?: string;
};

export type Resource = EvmResource | SubstrateResource | BitcoinResource;

export enum ResourceType {
  FUNGIBLE = 'fungible',
  NON_FUNGIBLE = 'nonfungible',
  PERMISSIONED_GENERIC = 'permissionedGeneric',
  PERMISSIONLESS_GENERIC = 'permissionlessGeneric',
}

interface BaseResource {
  resourceId: string;
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

export enum FeeHandlerType {
  TWAP = 'twap',
  BASIC = 'basic',
  PERCENTAGE = 'percentage',
}

export type XcmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior:
      | 'here'
      | {
          x3: Array<{ parachain: number } | { generalKey: [number, string] }>; // This is a tuple of length and value
        };
  };
};

export type BitcoinResource = BaseResource & {
  address: string;
  script: string;
  tweak: string;
  feeAmount?: number;
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
  feeHandler?: FeeHandler;
};

export type TransferStatus = 'pending' | 'executed' | 'failed';

export type TransferStatusResponse = {
  status: TransferStatus;
  explorerUrl: string;
  fromDomainId: number;
  toDomainId: number;
  sourceHash: string;
  destinationHash: string;
  depositNonce: number;
};

export interface BaseConfig<T> {
  id: number;
  chainId: number;
  caipId: string;
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
  parachainId: ParachainId;
}

export interface BitcoinConfig extends BaseConfig<Network.BITCOIN> {
  feeAddress: string;
}

export type SygmaDomainConfig = EthereumConfig | SubstrateConfig | BitcoinConfig;

export type IndexerRoutesResponse = { routes: RouteIndexerType[] };

export type Handler = {
  type: ResourceType;
  address: string;
};

export interface SygmaConfig {
  domains: Array<EthereumConfig | SubstrateConfig | BitcoinConfig>;
}

export type RouteIndexerType = {
  fromDomainId: string;
  toDomainId: string;
  resourceId: string;
  type: RouteType;
};

export type DomainMetadata = {
  url: string; // icon url
};

export type EnvironmentMetadata = {
  // domainID -> DomainMetadata
  [key: number]: DomainMetadata;
};

// either caipId, chainId or a domain object itself
export type Domainlike = string | number | Domain;

export interface Eip1193Provider {
  request(request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}
