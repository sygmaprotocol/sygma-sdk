export enum Environment {
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export type Domain = {
  id: number;
  name: string;
};

export enum ResourceType {
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  PERMISSIONED_GENERIC = 'permissionedGeneric',
  PERMISSIONLESS_GENERIC = 'permissionlessGeneric',
}

export enum Network {
  EVM = 'evm',
  SUBSTRATE = 'substrate',
}

export type Resource = {
  resourceId: string;
  type:
    | ResourceType.ERC20
    | ResourceType.ERC721
    | ResourceType.PERMISSIONED_GENERIC
    | ResourceType.PERMISSIONLESS_GENERIC;
  address: string;
  symbol: string;
  decimals: number;
};

export type Handler = {
  type:
    | ResourceType.ERC20
    | ResourceType.ERC721
    | ResourceType.PERMISSIONED_GENERIC
    | ResourceType.PERMISSIONLESS_GENERIC;
  address: string;
};

export interface BaseConfig<Type> {
  id: number;
  chainId: number;
  name: string;
  type: Type;
  bridgeAddress: string;
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
  feeHandlers: Array<Handler>;
}

export interface SubstrateConfig extends BaseConfig<Network.SUBSTRATE> {
  handlers: Array<Handler>;
}

export interface ConfigDomains {
  domains: Array<EthereumConfig | SubstrateConfig>;
}
