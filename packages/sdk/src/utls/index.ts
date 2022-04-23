import { Bridge } from '@chainsafe/chainbridge-contracts';
import { utils, BigNumber, ethers } from 'ethers';

import {
	BridgeData,
	BridgeEventCallback,
	BridgeEvents,
	Bridges,
	ChainbridgeContracts,
	ChainbridgeErc20Contracts,
	ChainbridgeProviders,
} from '../types';

export const computeBridges = (contracts: ChainbridgeContracts): Bridges =>
	Object.keys(contracts).reduce((bridges: any, chain) => {
		const { bridge } = contracts[chain];
		bridges = {
			...bridges,
			[chain]: bridge,
		};

		return bridges;
	}, {});

export const computeERC20Contracts = (contracts: ChainbridgeContracts): ChainbridgeErc20Contracts =>
	Object.keys(contracts).reduce((erc20Contracts: any, chain) => {
		const { erc20 } = contracts[chain];
		erc20Contracts = {
			...erc20Contracts,
			[chain]: erc20,
		};

		return erc20Contracts;
	}, {});

export const computeBridgeEvents = (contracts: ChainbridgeContracts) =>
	Object.keys(contracts).reduce((bridgeEvents: any, chain) => {
		const { bridgeEvent } = contracts[chain];
		const [entries] = Object.entries(contracts).filter((e:any) => e[0] !== chain);

		const proposalEeventDestinationBridge = computeProposalEvents(entries[1].bridge);

		bridgeEvents = {
			...bridgeEvents,
			[chain]: {
				bridgeEvents: bridgeEvent,
				proposalEvents: {
					[entries[0]]: proposalEeventDestinationBridge,
				},
			},
		};

		return bridgeEvents;
	}, {});

export const computeProposalEvents = (destinationBridge: Bridge): BridgeEventCallback => {
	const proposalFilter = destinationBridge.filters.ProposalEvent(null, null, null, null);

	const destinationProposalEvents = (func: any) =>
		destinationBridge.on(proposalFilter, (originDomainId, despositNonce, status, dataHash, tx) => {
			func(originDomainId, despositNonce, status, dataHash, tx);
		});

	return destinationProposalEvents;
};

export const computeProviders = (bridgeSetup: BridgeData, address: string): ChainbridgeProviders =>
	Object.keys(bridgeSetup).reduce((providers: any, chain) => {
		const { rpcURL } = bridgeSetup[chain as keyof BridgeData];

		const provider = new ethers.providers.JsonRpcProvider(rpcURL);
		const signer = provider.getSigner(address);

		providers = {
			...providers,
			[chain]: { provider, signer },
		};

		return providers;
	}, {});

export const processAmountForERC20Transfer = (amount: number): string => {
	const parsedAmountToERC20Decimals = utils.parseUnits(amount.toString(), 18);

	const toBigNumber = BigNumber.from(parsedAmountToERC20Decimals);

	const toHexString = toBigNumber.toHexString();

	const amountTransformedToData = utils.hexZeroPad(toHexString, 32).substr(2);

	return amountTransformedToData;
};

export const processLenRecipientAddress = (recipientAddress: string): string => {
	const hexilifiedLenOfRecipientAddress = utils.hexlify((recipientAddress.length - 2) / 2);

	const toHexString = utils.hexZeroPad(hexilifiedLenOfRecipientAddress, 32).substr(2);

	return toHexString;
};
