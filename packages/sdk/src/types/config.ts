import type { ParachainID } from 'chains/Substrate/index.js';
import type { FeeHandlerType, Resource, ResourceType } from './types.js';

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
  parachainId: ParachainID;
}

export interface RawConfig {
  domains: Array<EthereumConfig | SubstrateConfig>;
}
