import { Bridge } from '@chainsafe/chainbridge-contracts';
import { utils, BigNumber } from 'ethers';
import { Connector } from '../connectors';

import {
	BridgeData,
	BridgeEventCallback,
	BridgeEvents,
	Bridges,
	ChainbridgeContracts,
	ChainbridgeErc20Contracts,
	ChainbridgeProviders,
	Provider,
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
		const [entries] = Object.entries(contracts).filter((e: any) => e[0] !== chain);

		const proposalEventDestinationBridge = computeProposalEvents(entries[1].bridge);

		const proposalVoteEvents = computeProposalVoteEvents(entries[1].bridge)

		bridgeEvents = {
			...bridgeEvents,
			[chain]: {
				bridgeEvents: bridgeEvent,
				proposalEvents: {
					[entries[0]]: proposalEventDestinationBridge
				},
				voteEvents: {
					[entries[0]]: proposalVoteEvents
				}
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

export const computeProposalVoteEvents = (destinationBridge: Bridge): BridgeEventCallback => {
	const proposalVoteFilter = destinationBridge.filters.ProposalVote(null, null, null, null)

	const destinationProposalVoteEvents = (func: any) => destinationBridge.on(
		proposalVoteFilter,
		(originDomainId, depositNonce, status, dataHash, tx) => {
			func(originDomainId, depositNonce, status, dataHash, tx)}
	)

	return destinationProposalVoteEvents
}

export const computeProvidersAndSigners = (bridgeSetup: BridgeData, address?: string): ChainbridgeProviders => Object.keys(bridgeSetup).reduce((providers: any, chain) => {
	if(typeof window !== "undefined"){
		if("ethereum" in window) {
			const connectorData = setConnector()
			const { signer, provider } = connectorData

			providers = {
				...providers,
				[chain]: { provider, signer },
			};

			return providers;
		}
	} else {
		const { rpcURL } = bridgeSetup[chain as keyof BridgeData];

		const connectorData = setConnector(rpcURL, address)
		const { signer, provider } = connectorData

		providers = {
			...providers,
			[chain]: { provider, signer },
		};

		return providers;
	}
}, {});

const setConnector = (rpcURL?: string, address?: string): Connector => {
	return Connector.getInstance(rpcURL, address)
}

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
