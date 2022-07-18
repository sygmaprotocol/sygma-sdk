import { Erc20Detailed } from '../Contracts/Erc20Detailed';
import { Bridge } from '@chainsafe/chainbridge-contracts';
import { ethers } from 'ethers';

export interface ChainbridgeSDK {}

export type Directions = 'chain1' | 'chain2';

export type Setup = {
  bridgeSetupList?: ChainbridgeBridgeSetupList;
  bridgeSetup: BridgeData;
  feeOracleSetup?: FeeOracleData;
};

export type ChainbridgeBridgeSetup = {
  name: string;
  networkId: string;
  bridgeAddress: string;
  erc20Address: string;
  erc20HandlerAddress: string;
  feeOracleHandlerAddress?: string;
  feeSettings: {
    type: 'basic' | 'feeOracle' | 'none';
    address: string;
  };
  erc20ResourceID: string;
  rpcURL: string;
  domainId: string;
  decimals: number;
};

export type ChainbridgeBridgeSetupList = ChainbridgeBridgeSetup[]

export type BridgeData = {
  chain1: ChainbridgeBridgeSetup;
  chain2: ChainbridgeBridgeSetup;
};

export type FeeOracleData = {
  feeOracleBaseUrl: string;
};

export type OracleResource = {
  baseEffectiveRate: string;
  tokenEffectiveRate: string;
  dstGasPrice: string;
  signature: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
  dataTimestamp: number;
  signatureTimestamp: number;
  expirationTimestamp: number;
};

export type FeeDataResult = {
  calculatedRate: string;
  erc20TokenAddress: string;
  feeData: string;
};

export type Bridges = { [chain: string]: Bridge | undefined } | undefined;

export type ChainbridgeContracts = {
  [chain: string]: { bridge: Bridge; erc20: Erc20Detailed };
};

export type BridgeEventCallback = (fn: (...params: any) => void) => Bridge;

export type ChainbridgeEventsObject =
  | {
      [chain: string]: BridgeEventCallback;
    }
  | undefined;

export type BridgeEvents =
  | {
      feeHandler: string;
    }
  | undefined;

export type ConnectionEvents = {
  chain1: BridgeEvents;
  chain2: BridgeEvents;
};

export type Events =
  | {
      chain1: BridgeEvents;
      chain2: BridgeEvents;
    }
  | undefined;

export type ChainbridgeProviders =
  | {
      [chain: string]: {
        provider: ethers.providers.JsonRpcProvider | Provider;
        signer: ethers.providers.JsonRpcSigner | Signer;
      };
    }

export type ChainbridgeErc20Contracts = Record<'chain1' | 'chain2', Erc20Detailed | undefined> | undefined;


export type Provider = ethers.providers.Provider | undefined;

export type Signer = ethers.providers.JsonRpcSigner | undefined;

export type ConnectorSigner = Record<'chain1' | 'chain2', Signer> | undefined;

export type ConnectorProvider = Record<'chain1' | 'chain2', Provider> | undefined;
