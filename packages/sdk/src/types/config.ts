import { Resource, ResourceType } from 'types';

export enum Environment {
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export enum Network {
  EVM = 'evm',
  SUBSTRATE = 'substrate',
}

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

export enum FeeHandlerType {
  BASIC,
  DYNAMIC,
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

export interface ConfigDomains {
  domains: Array<EthereumConfig | SubstrateConfig>;
}
