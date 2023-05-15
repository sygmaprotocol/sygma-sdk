export enum Environment {
  LOCAL = 'local',
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export enum Network {
  EVM = 'evm',
  SUBSTRATE = 'substrate',
}

export type Handler = {
  type: ResourceType;
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

export enum FeeHandlerType {
  BASIC = 'basic',
  DYNAMIC = 'oracle',
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

export interface RawConfig {
  domains: Array<EthereumConfig | SubstrateConfig>;
}
