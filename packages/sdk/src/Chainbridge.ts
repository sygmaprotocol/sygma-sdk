import { BigNumber, ethers, utils } from 'ethers';
import { Bridge__factory as BridgeFactory, Bridge } from '@chainsafe/chainbridge-contracts';
import { Erc20DetailedFactory } from './Contracts/Erc20DetailedFactory';
import { Erc20Detailed } from './Contracts/Erc20Detailed';

import {
  ChainbridgeSDK,
  Setup,
  BridgeData,
  ChainbridgeContracts,
  Provider,
  Bridges,
  Signer,
  ChainbridgeErc20Contracts,
  BridgeEventCallback,
  Events,
  Directions,
  ConnectorSigner,
  ConnectorProvider,
  ConnectionEvents,
  FeeOracleData,
  FeeDataResult,
  ChainbridgeBridgeSetupList,
  ChainbridgeBridgeSetup
} from './types';
import {
  computeBridges,
  computeERC20Contracts,
  computeProvidersAndSignersWeb3,
  computeProvidersAndSignersRPC,
  setConnectorWeb3,
  setConnectorRPC
} from './utils';
import { ERC20Bridge } from './chains';
import { calculateBasicfee, calculateFeeData } from './fee';
import Connector from './connectors/Connectors';

/**
 * Chainbridge is the main class that allows you to have bridging capabilities
 * with simple usage
 *
 */

export class Chainbridge implements ChainbridgeSDK {
  public bridgeSetupList: ChainbridgeBridgeSetupList | undefined;
  private ethersProvider: Provider = undefined;
  public bridgeSetup: BridgeData;
  public bridges: Bridges = {chain1: undefined, chain2: undefined};
  private signers: ConnectorSigner = {chain1: undefined, chain2: undefined};
  private erc20: ChainbridgeErc20Contracts = {chain1: undefined, chain2: undefined};
  private providers: ConnectorProvider = {chain1: undefined, chain2: undefined};
  private erc20Bridge: ERC20Bridge;
  private feeOracleSetup?: FeeOracleData;

  public constructor({ bridgeSetupList, bridgeSetup, feeOracleSetup }: Setup) {
    this.bridgeSetupList = bridgeSetupList ?? undefined;
    this.bridgeSetup = bridgeSetup;
    this.erc20Bridge = ERC20Bridge.getInstance();
    this.feeOracleSetup = feeOracleSetup;
  }

  public async initializeConnectionRPC(address: string): Promise<ConnectionEvents> {
    const providersAndSigners = computeProvidersAndSignersRPC(this.bridgeSetup, address);
    this.providers = {
      chain1: providersAndSigners!['chain1' as keyof BridgeData]
        .provider as ethers.providers.JsonRpcProvider,
      chain2: providersAndSigners!['chain2' as keyof BridgeData]
        .provider as ethers.providers.JsonRpcProvider,
    };

    this.signers = {
      chain1: providersAndSigners!['chain1' as keyof BridgeData].signer,
      chain2: providersAndSigners!['chain2' as keyof BridgeData].signer,
    };

    const contracts = this.computeContracts();

    // setup erc20 contracts
    this.erc20 = computeERC20Contracts(contracts);

    // setup bridges contracts
    this.bridges = computeBridges(contracts);

    const areFeeSettings = this.checkFeeSettings(this.bridgeSetup);
    let feeHandlerByNetwork;

    if (!areFeeSettings) {
      console.warn('No fee settings provided');
      feeHandlerByNetwork = {
        chain1: undefined,
        chain2: undefined,
      };
    } else {
      feeHandlerByNetwork = await this.checkFeeHandlerByNetwork(contracts);
    }

    return {
      chain1: {
        feeHandler: feeHandlerByNetwork.chain1,
      },
      chain2: {
        feeHandler: feeHandlerByNetwork.chain2,
      },
    };
  }

  public async initializeConnectionFromWeb3Provider(
    web3ProviderInstance: any,
  ) {
    const providersAndSigners = computeProvidersAndSignersWeb3(
      this.bridgeSetup,
      web3ProviderInstance,
    );

    this.providers = {
      chain1: providersAndSigners!['chain1' as keyof BridgeData]
        .provider as ethers.providers.Web3Provider,
      chain2: providersAndSigners!['chain2' as keyof BridgeData]
        .provider as ethers.providers.JsonRpcProvider,
    };

    this.signers = {
      chain1: providersAndSigners!['chain1' as keyof BridgeData].signer,
      chain2: providersAndSigners!['chain2' as keyof BridgeData].signer,
    };

    const contracts = this.computeContracts();

    // setup erc20 contracts
    this.erc20 = computeERC20Contracts(contracts);

    // setup bridges contracts
    this.bridges = computeBridges(contracts);

    const areFeeSettings = this.checkFeeSettings(this.bridgeSetup);
    let feeHandlerByNetwork;

    if (!areFeeSettings) {
      console.warn('No fee settings provided');
      feeHandlerByNetwork = {
        chain1: undefined,
        chain2: undefined,
      };
    } else {
      feeHandlerByNetwork = await this.checkFeeHandlerByNetwork(contracts);
    }
    return this
  }

  public async setHomeWeb3Provider(web3ProviderInstance: any, domainId?: string) {
    const connector = setConnectorWeb3(web3ProviderInstance)
    const network = await connector.provider?.getNetwork()
    let chain1: ChainbridgeBridgeSetup | undefined
    // DomainId for local setup
    if (domainId) {
      chain1 = this.bridgeSetupList!.find((el) => el.domainId === domainId)
    } else {
      chain1 = this.bridgeSetupList!.find((el) => Number(el.networkId) === network!.chainId)
    }

    if (!chain1) {
      throw `Cannot find network with chainId: ${network} in config`
    }

    this.bridgeSetup.chain1 = chain1
    this.providers!.chain1 = connector.provider
    this.signers!.chain1 = connector.signer

    const contracts = this.computeContract(chain1, connector);
    this.erc20!['chain1'] = contracts.erc20
    this.bridges!['chain1'] = contracts.bridge

    if (!chain1.feeSettings) {
      console.warn('No fee settings provided');
    }

    return this
  }

  public async setDestination(domainId: string) {
    let chain2: ChainbridgeBridgeSetup | undefined
    if (domainId) {
      chain2 = this.bridgeSetupList!.find((el) => el.domainId === domainId)
    }

    if (!chain2) {
      throw `Cannot find network with domainID: ${domainId} in config`
    }

    const connector = setConnectorRPC(chain2.rpcURL)

    this.providers!.chain2 = connector.provider
    this.signers!.chain2 = connector.signer

    const contracts = this.computeContract(chain2, connector);
    this.erc20!['chain2'] = contracts.erc20
    this.bridges!['chain2'] = contracts.bridge

    if (!chain2.feeSettings) {
      console.warn('No fee settings provided');
    }

    return this
  }

  private checkFeeSettings(bridgeSetup: BridgeData): boolean {
    return Object.keys(bridgeSetup)
      .reduce((acc, chain) => {
        const {
          feeSettings: { type },
        } = bridgeSetup[chain as keyof BridgeData];
        if (type !== 'none') {
          acc = [...acc, true];
          return acc;
        } else {
          acc = [...acc, false];
          return acc;
        }
      }, [] as boolean[])
      .every(bool => !!bool);
  }

  private computeContracts(): ChainbridgeContracts {
    return Object.keys(this.bridgeSetup).reduce((contracts: any, chain) => {
      const { bridgeAddress, erc20Address } = this.bridgeSetup[chain as keyof BridgeData];

      const signer = this.signers![chain as keyof BridgeData] ?? this.providers![chain as keyof BridgeData];

      const bridge = this.connectToBridge(bridgeAddress, signer!);
      const erc20Connected = this.connectERC20(erc20Address, signer!);
      contracts = {
        ...contracts,
        [chain]: { bridge, erc20: erc20Connected },
      };
      return contracts;
    }, {});
  }

  public computeContract(config: ChainbridgeBridgeSetup, connector: Connector) {
    const { bridgeAddress, erc20Address } = config;

    const signer = connector.signer ?? connector.provider

    const bridge = this.connectToBridge(bridgeAddress, signer!);
    const erc20 = this.connectERC20(erc20Address, signer!);
    return { bridge, erc20 }
  }

  private connectToBridge(bridgeAddress: string, signer: Signer | Provider): Bridge {
    return BridgeFactory.connect(bridgeAddress, signer!);
  }

  private async checkFeeHandlerByNetwork(contracts: ChainbridgeContracts) {
    return Object.keys(contracts).reduce(async (feeHandlers: any, chain) => {
      const { bridge } = contracts[chain as keyof BridgeData];
      const feeHandler = await this.checkFeeHandlerOnBridge(bridge);
      feeHandlers = {
        ...(await feeHandlers),
        [chain]: feeHandler,
      };

      return feeHandlers;
    }, Promise.resolve({}));
  }

  private async checkFeeHandlerOnBridge(bridge: Bridge): Promise<string> {
    return await bridge._feeHandler();
  }

  private connectERC20(
    erc20Address: string,
    signer: ethers.providers.JsonRpcSigner | Provider,
  ): Erc20Detailed {
    return Erc20DetailedFactory.connect(erc20Address, signer!);
  }

  public createDepositEventListener(chain: Directions, signer: Signer): BridgeEventCallback {
    const bridge = this.bridges![chain]!;

    const depositFilter = bridge.filters.Deposit(null, null, null, signer!._address, null, null);

    const depositEventListner = (callbackFn: any) =>
      bridge.once(
        depositFilter,
        (destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx) => {
          callbackFn(destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx);
        },
      );

    return depositEventListner;
  }

  public async removeDepositEventListener(chain: Directions, signer: Signer) {
    const bridge = this.bridges![chain]!;
    const depositFilter = bridge.filters.Deposit(null, null, null, signer!._address, null, null);
    return bridge.removeAllListeners(depositFilter)
  }

  public createHomeChainDepositEventListener(callback: any) {
    const signer = this.signers!['chain1'];
    return this.createDepositEventListener('chain1', signer)(callback);
  }

  public removeHomeChainDepositEventListener() {
    const signer = this.signers!['chain1'];
    return this.removeDepositEventListener('chain1', signer);
  }

  public createProposalExecutionEventListener(chain: Directions) {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);

    const proposalExecutionEventListener = (callbackFn: any) =>
      bridge.once(proposalFilter, (originDomainId, despositNonce, dataHash, tx) => {
        callbackFn(originDomainId, despositNonce, dataHash, tx);
      });

    return proposalExecutionEventListener;
  }

  public proposalExecutionEventListenerCount(chain: Directions) {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    const count = bridge.listenerCount(proposalFilter)
    return count;
  }

  public removeProposalExecutionEventListener(chain: Directions) {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    return bridge.removeAllListeners(proposalFilter)
  }

  public destinationProposalExecutionEventListener(callback: any) {
    return this.createProposalExecutionEventListener('chain2')(callback);
  }

  public removeDestinationProposalExecutionEventListener() {
    return this.removeProposalExecutionEventListener('chain2')
  }

  public async deposit({
    amount,
    recipientAddress,
    feeData,
  }: {
    amount: string;
    recipientAddress: string;
    feeData: string;
  }) {
    const erc20ToUse = this.erc20!.chain1!;
    const provider = this.providers!.chain1;
    const bridgeToUse = this.bridges!.chain1!;
    const { erc20HandlerAddress } = this.bridgeSetup.chain1;
    const { domainId, erc20ResourceID } = this.bridgeSetup.chain2;

    return await this.erc20Bridge.transferERC20({
      amount,
      recipientAddress,
      erc20Intance: erc20ToUse,
      bridge: bridgeToUse,
      provider,
      erc20HandlerAddress,
      domainId,
      resourceId: erc20ResourceID,
      feeData,
    });
  }

  public async fetchFeeData(params: {
    amount: string;
    recipientAddress: string;
    overridedResourceId?: string;
    oraclePrivateKey?: string;
  }) {
    const { amount, overridedResourceId, oraclePrivateKey, recipientAddress } = params;
    const {
      feeSettings: { type },
    } = this.bridgeSetup.chain1;

    if (type === 'none') {
      console.warn('No fee settings provided');
      return;
    }

    if (type !== 'basic' && this.feeOracleSetup?.feeOracleBaseUrl !== undefined) {
      return await this.fetchFeeOracleData({
        amount,
        recipientAddress,
        overridedResourceId,
        oraclePrivateKey,
      });
    } else {
      return await this.fetchBasicFeeData({
        amount,
        recipientAddress,
      });
    }
  }

  public async fetchBasicFeeData(params: {
    amount: string;
    recipientAddress: string;
  }) {
    const { amount, recipientAddress } = params;
    const {
      feeSettings: { address: basicFeeHandlerAddress },
      domainId: fromDomainID,
      erc20ResourceID: resourceID,
    } = this.bridgeSetup.chain1;
    const { domainId: toDomainID } = this.bridgeSetup.chain2;
    const provider = this.providers!.chain1!;
    // const sender = this.signers![from]?._address!;
    try {
      const sender = await this.signers!.chain1?.getAddress();
      const basicFee = await calculateBasicfee({
        basicFeeHandlerAddress,
        provider,
        sender: sender ?? ethers.constants.AddressZero,

        fromDomainID,
        toDomainID,
        resourceID,
        tokenAmount: Number(amount),
        recipientAddress,
      });

      return basicFee;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  private async fetchFeeOracleData(params: {
    amount: string;
    recipientAddress: string;
    overridedResourceId?: string;
    oraclePrivateKey?: string;
  }) {
    if (
      !this.feeOracleSetup &&
      this.bridgeSetup.chain1.feeOracleHandlerAddress
    ) {
      console.log('No feeOracle config');
      return;
    }
    const { amount, recipientAddress, overridedResourceId, oraclePrivateKey } = params;
    const provider = this.providers!.chain1!;
    const { erc20Address, feeOracleHandlerAddress = '' } = this.bridgeSetup.chain1;
    const { feeOracleBaseUrl } = this.feeOracleSetup!;

    // We use sender address or zero because of contracts
    const sender = this.signers!.chain1?._address ?? ethers.constants.AddressZero;

    const feeData = calculateFeeData({
      provider,
      sender,
      recipientAddress,
      fromDomainID: parseInt(this.bridgeSetup.chain1.domainId),
      toDomainID: parseInt(this.bridgeSetup.chain1.domainId),
      tokenResource: erc20Address,
      tokenAmount: Number(amount),
      feeOracleBaseUrl,
      feeOracleHandlerAddress,
      overridedResourceId, // '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
      oraclePrivateKey, //'0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e'
    });

    // feeOracleBaseUrl: 'http://localhost:8091',
    // FeeHandlerWithOracleAddress: '0xa9ddD97e1762920679f3C20ec779D79a81903c0B',
    return feeData;
  }

  public async waitForTransactionReceipt(txHash: string) {
    const receipt = await this.ethersProvider?.waitForTransaction(txHash, 1);
    return receipt;
  }

  public async hasTokenSupplies(amount: number): Promise<boolean> {
    const {
      erc20Address: destinationTokenAddress,
      erc20HandlerAddress,
      decimals,
    } = this.bridgeSetup.chain2;
    const provider = this.providers!.chain2;

    const hasTokenSupplies = await this.erc20Bridge.hasTokenSupplies(
      amount,
      'chain2',
      provider,
      destinationTokenAddress,
      erc20HandlerAddress,
      decimals,
    );

    return hasTokenSupplies;
  }

  public async checkCurrentAllowance( recipientAddress: string) {
    const erc20ToUse = this.erc20!.chain1!;
    const { erc20HandlerAddress } = this.bridgeSetup.chain1;

    return await this.erc20Bridge.checkCurrentAllowance(
      recipientAddress,
      erc20ToUse,
      erc20HandlerAddress,
    );
  }

  public async isEIP1559MaxFeePerGas(from: Directions) {
    const provider = this.providers![from];

    return await this.erc20Bridge.isEIP1559MaxFeePerGas(provider);
  }

  public async getTokenInfo(chain: Directions) {
    const { erc20Address } = this.bridgeSetup[chain];
    const provider = this.providers![chain];
    const address = await this.getSignerAddress(chain);

    return await this.erc20Bridge.getTokenInfo(erc20Address, address!, provider);
  }

  public async getTokenBalance(erc20Contract: Erc20Detailed, address: string): Promise<BigNumber> {
    return await this.erc20Bridge.getERC20Balance(erc20Contract, address);
  }

  public async getSignerBalance(chain: string) {
    return await (this.signers![chain as keyof BridgeData] as Signer)?.getBalance();
  }

  public async getSignerAddress(chain: string) {
    return await (this.signers![chain as keyof BridgeData] as Signer)?.getAddress();
  }

  public async getSignerGasPrice(chain: string) {
    return await (this.signers![chain as keyof BridgeData] as Signer)?.getGasPrice();
  }

  public async approve({ amounForApproval}: { amounForApproval: string }) {
    const amountForApprovalBN = utils.parseUnits(amounForApproval, 18);

    const gasPrice = await this.isEIP1559MaxFeePerGas('chain1');
    console.log("🚀 ~ file: Chainbridge.ts ~ line 465 ~ Chainbridge ~ approve ~ gasPrice", gasPrice)

    const erc20ToUse = this.erc20!.chain1!;
    const { erc20HandlerAddress } = this.bridgeSetup.chain1;

    return await this.erc20Bridge.approve(
      amountForApprovalBN,
      erc20ToUse,
      erc20HandlerAddress,
      gasPrice as BigNumber,
    );
  }
}
