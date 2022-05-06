import { Erc20Detailed } from '../Contracts/Erc20Detailed';
import { Bridge } from '@chainsafe/chainbridge-contracts';
import { ethers } from 'ethers';

export interface ChainbridgeSDK { }

export type Directions = "chain1" | "chain2"

export type Setup = {
	bridgeSetup: BridgeData;
};

export type ChainbridgeBridgeSetup = {
	bridgeAddress: string;
	erc20Address: string;
	erc20HandlerAddress: string;
	erc20ResourceID: string;
	rpcURL: string;
	domainId: string;
	decimals: number;
};

export type BridgeData = {
	chain1: ChainbridgeBridgeSetup;
	chain2: ChainbridgeBridgeSetup;
};

export type Bridges = { [chain: string]: Bridge } | undefined;

export type ChainbridgeContracts = {
	[chain: string]: { bridge: Bridge; bridgeEvent: any; erc20: Erc20Detailed };
};

export type BridgeEventCallback = (fn: (...params: any) => void) => Bridge;

export type ChainbridgeEventsObject =
	| {
		[chain: string]: BridgeEventCallback;
	}
	| undefined;

export type BridgeEvents =
	| { bridgeEvents: ((func: any) => Bridge), proposalEvents: ChainbridgeEventsObject, voteEvents: ChainbridgeEventsObject }
	| undefined;

export type ConnectionEvents = {
	chain1: BridgeEvents,
	chain2: BridgeEvents
}

export type Events =
	| {
		chain1: BridgeEvents;
		chain2: BridgeEvents;
	}
	| undefined;

export type ChainbridgeProviders =
	| {
		[chain: string]: {
			provider: ethers.providers.JsonRpcProvider;
			signer: ethers.providers.JsonRpcSigner;
		};
	}
	| undefined;

export type ChainbridgeErc20Contracts = { [chain: string]: Erc20Detailed } | undefined;

export type Provider = ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;

export type Signer = ethers.providers.JsonRpcSigner | undefined;

export type ConnectorSigner = Record<"chain1" | "chain2", Signer> | undefined

export type ConnectorProvider = Record<"chain1" | "chain2", Provider> | undefined
