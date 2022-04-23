import { ethers } from 'ethers';
import { Bridge__factory as BridgeFactory, Bridge } from '@chainsafe/chainbridge-contracts';
import { Erc20DetailedFactory } from './Contracts/Erc20DetailedFactory';
import { Erc20Detailed } from './Contracts/Erc20Detailed';

import {
	ChainbridgeSDK,
	Setup,
	ChainbridgeBridgeSetup,
	BridgeData,
	ChainbridgeContracts,
	BridgeEvents,
	Provider,
	Bridges,
	ChainbridgeProviders,
	Signer,
	ChainbridgeEventsObject,
	ChainbridgeErc20Contracts,
	BridgeEventCallback,
	Events,
	Directions,
} from './types';
import {
	computeBridgeEvents,
	computeBridges,
	computeERC20Contracts,
	computeProviders,
} from './utls';
import { ERC20Bridge } from './chains';

/**
 * Chainbridge is the main class that allows you to have bridging capabilities
 * with simple usage
 *
 * what do we need to define Chainbridge instance
 */

export class Chainbridge implements ChainbridgeSDK {
	private ethersProvider: Provider = undefined;
	private bridgeSetup: BridgeData;
	private bridges: Bridges = undefined;
	public bridgeEvents: Events = undefined;
	private signer: Signer = undefined;
	private erc20: ChainbridgeErc20Contracts = undefined;
	private providers: ChainbridgeProviders = undefined;
	private erc20Bridge: ERC20Bridge

	public constructor({ bridgeSetup }: Setup) {
		this.bridgeSetup = bridgeSetup;
		this.erc20Bridge = ERC20Bridge.getInstance()
	}

	public initializeConnection(address: string): {
		chain1: BridgeEvents,
		chain2: BridgeEvents
	} {
		this.providers = computeProviders(this.bridgeSetup, address);

		// TODO CHECK HOW TO TYPE REDUCERS
		const contracts = this.computeContracts();

		// this returns bridge events object
		this.bridgeEvents = computeBridgeEvents(contracts);

		// setup erc20 contracts
		this.erc20 = computeERC20Contracts(contracts);

		// setup bridges contracts
		this.bridges = computeBridges(contracts);

		return { chain1: this.bridgeEvents?.chain1, chain2: this.bridgeEvents?.chain2 };
	}

	private computeContracts(): ChainbridgeContracts {
		return Object.keys(this.bridgeSetup).reduce((contracts: any, chain) => {
			console.log('chain', chain);
			const { bridgeAddress, erc20Address } = this.bridgeSetup[chain as keyof BridgeData];

			const { signer } = this.providers![chain as keyof BridgeData];

			const bridge = this.connectToBridge(bridgeAddress, signer!);
			const bridgeEvent = this.getBridgeDepositEvents(bridge, signer)
			const erc20Connected = this.connectERC20(erc20Address, signer!);
			contracts = {
				...contracts,
				[chain]: { bridge, bridgeEvent, erc20: erc20Connected },
			};
			return contracts;
		}, {});
	}

	private connectToBridge(bridgeAddress: string, signer: Signer): Bridge {
		return BridgeFactory.connect(bridgeAddress, signer!);
	}

	private getBridgeDepositEvents(bridge: Bridge, signer: Signer) {
		return this.bridgeDepositEvent(bridge, signer!);
	}

	private connectERC20(
		erc20Address: string,
		signer: ethers.providers.JsonRpcSigner,
	): Erc20Detailed {
		return Erc20DetailedFactory.connect(erc20Address, signer);
	}

	private bridgeDepositEvent(bridge: Bridge, signer: Signer): BridgeEventCallback {
		// console.log("signer address", signer._address)
		const depositFilter = bridge.filters.Deposit(null, null, null, signer!._address, null, null);

		const bridgeEvent = (func: any) =>
			bridge.once(
				depositFilter,
				(destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx) => {
					func(destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx);
				},
			);

		return bridgeEvent;
	}

	public async transferERC20(
		amount: number,
		recipientAddress: string,
		from: Directions, // change this for a type
		to: Directions, // change this for a type
	) {

		const erc20ToUse = this.erc20![from];
		const {provider} = this.providers![from]
		const bridgeToUse = this.bridges![from]
		const {erc20HandlerAddress} = this.bridgeSetup[from]
		const { domainId, erc20ResourceID } = this.bridgeSetup[to]

		return await this.erc20Bridge.transferERC20(
			amount,
			recipientAddress,
			erc20ToUse,
			bridgeToUse,
			provider,
			erc20HandlerAddress,
			domainId,
			erc20ResourceID
		)
	}

	public async waitForTransactionReceipt(txHash: string) {
		const receipt = await this.ethersProvider?.waitForTransaction(txHash, 1);
		return receipt;
	}

	public async hasTokenSupplies(
		amount: number,
		to: Directions
	) {
		const { erc20Address: destinationTokenAddress, erc20HandlerAddress, decimals } = this.bridgeSetup[to]
		const { provider } = this.providers![to]

		return await this.erc20Bridge.hasTokenSupplies(
			amount,
			to,
			provider,
			destinationTokenAddress,
			erc20HandlerAddress,
			decimals
		)
	}

	public async checkCurrentAllowance(from: Directions, recipientAddress: string) {

		const erc20ToUse = this.erc20![from]
		const { erc20HandlerAddress } = this.bridgeSetup[from]

		return await this.erc20Bridge.checkCurrentAllowance(
			recipientAddress,
			erc20ToUse,
			erc20HandlerAddress
		)
	}

	public async isEIP1559MaxFeePerGas(from: string) {
		const { provider } = this.providers![from]

		return await this.erc20Bridge.isEIP1559MaxFeePerGas(
			provider
		)
	}

}
