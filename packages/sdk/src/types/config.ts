export enum Environment {
  LOCAL = 'local',
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export type Domain = {
  id: number;
  name: string;
};

export enum ResourceType {
  FUNGIBLE = 'fungible',
  NON_FUNGIBLE = 'nonFungible',
  PERMISSIONED_GENERIC = 'permissionedGeneric',
  PERMISSIONLESS_GENERIC = 'permissionlessGeneric',
}

export enum Network {
  EVM = 'evm',
  SUBSTRATE = 'substrate',
}

export type Resource = {
  resourceId: string;
  type: ResourceType;
  address: string;
  symbol?: string;
  decimals?: number;
};

export type Handler = {
  type: ResourceType;
  address: string;
};

export enum FeeHandlerType {
  ORACLE = 'oracle',
  BASIC = 'basic',
}

export type FeeHandler = {
  type: FeeHandlerType.BASIC | FeeHandlerType.ORACLE;
  address: string;
};

export interface BaseConfig<Type> {
  id: number;
  chainId: number;
  name: string;
  type: Type;
  bridge: string;
  nativeTokenSymbol: string;
  nativeTokenName: string;
  nativeTokenDecimals: BigInt;
  startBlock: BigInt;
  blockConfirmations: number;
  resources: Array<Resource>;
}

export interface EthereumConfig extends BaseConfig<Network.EVM> {
  handlers: Array<Handler>;
  feeRouter: string;
  feeHandlers: Array<FeeHandler>;
}

export interface SubstrateConfig extends BaseConfig<Network.SUBSTRATE> {
  handlers: Array<Handler>;
}

export interface RawConfig {
  domains: Array<EthereumConfig | SubstrateConfig>;
}
