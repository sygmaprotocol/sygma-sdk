import { Erc20Detailed } from '../Contracts/Erc20Detailed';
import { Bridge, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';

export interface SygmaSDK {}

export type Directions = 'chain1' | 'chain2';

export type Setup = {
  bridgeSetupList?: SygmaBridgeSetupList;
  bridgeSetup?: BridgeData;
  feeOracleSetup?: FeeOracleData;
};

export type TokenConfig = {
  type: "erc20" | 'erc721'
  address: string;
  name?: string;
  symbol?: string;
  imageUri?: string;
  resourceId: string;
  isNativeWrappedToken?: boolean;
  decimals?: number;
  isDoubleApproval?: boolean;
  feeSettings: {
    type: FeeType;
    address: string;
  };
};

export type FeeType = 'basic' | 'feeOracle' | 'none'

export type SygmaBridgeSetup = {
  name: string;
  networkId: number;
  bridgeAddress: string;
  erc20HandlerAddress: string;
  erc721HandlerAddress: string;
  feeOracleHandlerAddress?: string;
  rpcUrl: string;
  domainId: string;
  decimals: number;
  tokens: TokenConfig[]
};

export type SygmaBridgeSetupList = SygmaBridgeSetup[]

export type BridgeData = {
  chain1: SygmaBridgeSetup;
  chain2: SygmaBridgeSetup;
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
  type: FeeType,
  fee: ethers.BigNumber;
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

export type SygmaProviders =
  | {
      [chain: string]: {
        provider: ethers.providers.JsonRpcProvider | Provider;
        signer: ethers.providers.JsonRpcSigner | Signer;
      };
    }

export type SygmaErc20Contracts = { [chain: string]: Erc20Detailed | ERC721MinterBurnerPauser | undefined } | undefined;

export type Provider = ethers.providers.Provider | undefined;

export type Signer = ethers.providers.JsonRpcSigner | undefined;

export type ConnectorSigner = Record<'chain1' | 'chain2', Signer> | undefined;

export type ConnectorProvider = Record<'chain1' | 'chain2', Provider> | undefined;
