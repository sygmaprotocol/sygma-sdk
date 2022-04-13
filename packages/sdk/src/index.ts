import { BigNumber, ethers, providers, utils, Event } from 'ethers';
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
} from './types';
import {
	computeBridgeEvents,
	computeBridges,
	computeERC20Contracts,
	computeProviders,
	processAmountForERC20Transfer,
	processLenRecipientAddress,
} from './utls';

/**
 * Chainbridge is the main class that allows you to have bridging capabilities
 * with simple usage
 *
 * what do we need to define Chainbridge instance
 */

export class Chainbridge implements ChainbridgeSDK {
	private url: string = '';
	private SDKName: string = '';
	public ethersProvider: Provider = undefined;
	public bridgeSetup: BridgeData;
	private bridges: Bridges = undefined;
	private bridgeEvents: BridgeEvents = undefined;
	private signer: Signer = undefined;
	private erc20: ChainbridgeErc20Contracts = undefined;
	private providers: ChainbridgeProviders = undefined;

	public constructor({ provider, bridgeSetup }: Setup) {
		this.bridgeSetup = bridgeSetup;
		this.ethersProvider = provider as ethers.providers.JsonRpcProvider;
	}

	public get getUrl() {
		return this.url;
	}

	public get getSDKName() {
		return this.SDKName;
	}

	public initializeConnection(address: string): BridgeEvents {
		this.providers = computeProviders(this.bridgeSetup, address);

		// TODO CHECK HOW TO TYPE REDUCERS
		const contracts = this.computeContractrs();

		// this returns bridge events object
		this.bridgeEvents = computeBridgeEvents(contracts);

		// setup erc20 contracts
		this.erc20 = computeERC20Contracts(contracts);

		// setup bridges contracts
		this.bridges = computeBridges(contracts);

		return this.bridgeEvents!;
	}

	private computeContractrs(): ChainbridgeContracts {
		return Object.keys(this.bridgeSetup).reduce((contracts: any, chain) => {
			console.log('chain', chain);
			const { bridgeAddress, erc20Address } = this.bridgeSetup[chain as keyof BridgeData];

			const { signer } = this.providers![chain as keyof BridgeData];

			const { bridge, bridgeEvent } = this.connectToBridge(bridgeAddress, signer!);
			const erc20Connected = this.connectERC20(erc20Address, signer!);
			contracts = {
				...contracts,
				[chain]: { bridge, bridgeEvent, erc20: erc20Connected },
			};
			return contracts;
		}, {});
	}

	private connectToBridge(bridgeAddress: string, signer: Signer) {
		const bridge = BridgeFactory.connect(bridgeAddress, signer!);
		const bridgeEvent = this.bridgeDepositEvent(bridge, signer!);
		return { bridge, bridgeEvent };
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

	// TODO: THIS SHOULD BE CALLED BEFORE TRANSFERRING
	// TODO: PROVIDE DIRECTION OF THE TRANSFER AND TEST THIS
	private proposalEvents(destinationBridge: Bridge): BridgeEventCallback {
		const proposalEventsFilter = destinationBridge.filters.ProposalEvent(null, null, null, null);

		const destinationProposalEvents = (func: any) =>
			destinationBridge.on(
				proposalEventsFilter,
				(originDomainId, despositNonce, status, dataHash, tx) => {
					func(originDomainId, despositNonce, status, dataHash, tx);
				},
			);

		return destinationProposalEvents;
	}

	public async transferERC20(
		amount: number,
		recipientAddress: string,
		from: 'chain1' | 'chain2',
		direction: 'chain1' | 'chain2',
	) {

		// TO DEPOSIT WE NEED THE FOLLOWING:
		// TOKEN AMOUNT OR ID TO DEPOSIT (32 BYTES)
		// len(RecipientAddress) (32 BYTES)
		// recipientAddress (32 BYTES)

		// TOKEN AMOUNT TO DEPOSIT IN 32 BYTES
		const amountTransformedToData = processAmountForERC20Transfer(amount);
		// console.log("amount transformed", amountTransformedToData)

		// LEN(RECIPIENTADDRESS) 32 BYTES
		const toHexString = processLenRecipientAddress(recipientAddress);

		// console.log("len of recipient address", toHexString)

		// RECIPIENT ADDRESS (32 BYTES)
		const recipientAddressTo32 = recipientAddress.substr(2);

		const dataToSend = `0x${amountTransformedToData}${toHexString}${recipientAddressTo32}`;

		console.log('DATA TO SEND', dataToSend);

		const feeData = await this.ethersProvider?.getFeeData();

		// console.log("fee data", feeData)
		console.log('parsed fee', feeData?.gasPrice?.toString());

		const amountForApproval = utils.parseUnits(amount.toString(), 18);

		const amountForApprovalBN = BigNumber.from(amountForApproval);

		let approval = { hash: '' };

		const erc20ToUse = this.erc20![direction];

		try {
			const { erc20HandlerAddress } = this.bridgeSetup[direction];
			const a = await erc20ToUse.approve(erc20HandlerAddress, amountForApprovalBN, {
				gasPrice: feeData?.gasPrice?.toString(),
			});

			if (a !== undefined) {
				approval = a;
			}
		} catch (err) {
			console.log('Approve error', err);
		}

		// console.log("approved", approval)

		const bridgeFee = await this.bridges![direction]?._fee();

		const bridgeFeeTransformed = utils.parseUnits(bridgeFee?.toString()!, 18);

		console.log(
			'BRIDGE FEE',
			bridgeFeeTransformed.toString(),
			BigNumber.from('0x5DB698').toString(),
		);

		let depositAction;

		const bridgeToUse = this.bridges![direction];

		const destinationProposalEvents = this.proposalEvents(direction);
		try {
			depositAction = await bridgeToUse.deposit(
				BigNumber.from(destinationChainId), // DESTINATION CHAIN ID,
				this.bridgeSetup[direction].erc20ResourceID,
				dataToSend,
				{
					gasPrice: feeData?.gasPrice?.toString(),
					value: utils.parseUnits((bridgeFee || 0).toString(), 18),
					gasLimit: BigNumber.from('0x5DB698').toString(),
				},
			);
			// console.log('deposit action', depositAction);

			return {
				approvalTxHash: approval.hash,
				depositTxHash: depositAction?.hash,
				destinationProposalEvents,
			};
		} catch (e) {
			console.log('Error =====>>>', e);
		}
	}

	public async waitForTransactionReceipt(txHash: string) {
		const receipt = await this.ethersProvider?.waitForTransaction(txHash, 1);
		return receipt;
	}

}
