import { BigNumber, ethers, utils } from 'ethers';
import { Bridge__factory as BridgeFactory, Bridge } from '@chainsafe/chainbridge-contracts';
import { Erc20DetailedFactory } from './Contracts/Erc20DetailedFactory';
import { Erc20Detailed } from './Contracts/Erc20Detailed';

import {
  SygmaSDK,
  Setup,
  BridgeData,
  ChainbridgeContracts,
  Provider,
  Bridges,
  Signer,
  SygmaErc20Contracts,
  BridgeEventCallback,
  Events,
  Directions,
  ConnectorSigner,
  ConnectorProvider,
  ConnectionEvents,
  FeeOracleData,
  FeeDataResult,
  SygmaBridgeSetupList,
  SygmaBridgeSetup,
} from './types';
import {
  computeBridges,
  computeERC20Contracts,
  computeProvidersAndSignersWeb3,
  computeProvidersAndSignersRPC,
  setConnectorWeb3,
  setConnectorRPC,
} from './utils';
import { ERC20Bridge } from './chains';
import { calculateBasicfee, calculateFeeData } from './fee';
import Connector from './connectors/Connectors';

/**
 * @description Sygma is the main class that allows you to have bridging capabilities
 * with simple usage
 *
 */

export class Sygma implements SygmaSDK {
  public bridgeSetupList: SygmaBridgeSetupList | undefined;
  private ethersProvider: Provider = undefined;
  public bridgeSetup: BridgeData;
  public bridges: Bridges = { chain1: undefined, chain2: undefined };
  private signers: ConnectorSigner = { chain1: undefined, chain2: undefined };
  private erc20: SygmaErc20Contracts = { chain1: undefined, chain2: undefined };
  private providers: ConnectorProvider = { chain1: undefined, chain2: undefined };
  private erc20Bridge: ERC20Bridge;
  private feeOracleSetup?: FeeOracleData;
  public selectedToken: number = 0;

  public constructor({ bridgeSetupList, bridgeSetup, feeOracleSetup }: Setup) {
    this.bridgeSetupList = bridgeSetupList ?? undefined;
    this.bridgeSetup = bridgeSetup;
    this.erc20Bridge = ERC20Bridge.getInstance();
    this.feeOracleSetup = feeOracleSetup;
  }

  public async initializeConnectionRPC(address: string) {
    this.bridgeSetupList = Object.values(this.bridgeSetup);
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

    if (!areFeeSettings) {
      console.warn('No fee settings provided');
    }

    return this;
  }

  public selectHomeNetwork(homeNetworkChainId: number) {
    return this.bridgeSetupList?.find(el => el.networkId === homeNetworkChainId);
  }

  public selectOneForDestination(homeNetworkChainId: number) {
    return this.bridgeSetupList?.filter(el => el.networkId !== homeNetworkChainId)[0];
  }

  public async initializeConnectionFromWeb3Provider(web3ProviderInstance: any) {
    const homeNetworkChainId = BigNumber.from(web3ProviderInstance.chainId).toNumber();
    this.bridgeSetup = {
      chain1: this.selectHomeNetwork(homeNetworkChainId)!,
      chain2: this.selectOneForDestination(homeNetworkChainId)!,
    };
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

    if (!areFeeSettings) {
      console.warn('No fee settings provided');
    }
    return this;
  }

  public async setHomeWeb3Provider(web3ProviderInstance: any, domainId?: string) {
    const connector = setConnectorWeb3(web3ProviderInstance);
    const network = await connector.provider?.getNetwork();
    let chain1: SygmaBridgeSetup | undefined;
    // DomainId is used only for Local Setup
    if (domainId) {
      chain1 = this.bridgeSetupList!.find(el => el.domainId === domainId);
    } else {
      chain1 = this.bridgeSetupList!.find(el => Number(el.networkId) === network!.chainId);
    }

    if (!chain1) {
      throw `Cannot find network with chainId: ${network} in config`;
    }

    this.bridgeSetup.chain1 = chain1;
    this.providers!.chain1 = connector.provider;
    this.signers!.chain1 = connector.signer;

    const contracts = this.computeContract(chain1, connector);
    this.erc20!['chain1'] = contracts.erc20;
    this.bridges!['chain1'] = contracts.bridge;

    if (!chain1.feeSettings) {
      console.warn('No fee settings provided');
    }

    return this;
  }

  public async setDestination(domainId: string) {
    let chain2: SygmaBridgeSetup | undefined;
    if (domainId) {
      chain2 = this.bridgeSetupList!.find(el => el.domainId === domainId);
    }

    if (!chain2) {
      throw `Cannot find network with domainID: ${domainId} in config`;
    }

    const connector = setConnectorRPC(chain2.rpcUrl);

    this.providers!.chain2 = connector.provider;
    this.signers!.chain2 = connector.signer;

    const contracts = this.computeContract(chain2, connector);
    this.erc20!['chain2'] = contracts.erc20;
    this.bridges!['chain2'] = contracts.bridge;

    if (!chain2.feeSettings) {
      console.warn('No fee settings provided');
    }

    return this;
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
      const { bridgeAddress } = this.bridgeSetup[chain as keyof BridgeData];
      const erc20Address = this.bridgeSetup[chain as keyof BridgeData].tokens![this.selectedToken]
        .address;

      const signer =
        this.signers![chain as keyof BridgeData] ?? this.providers![chain as keyof BridgeData];

      const bridge = this.connectToBridge(bridgeAddress, signer!);
      const erc20Connected = this.connectERC20(erc20Address, signer!);
      contracts = {
        ...contracts,
        [chain]: { bridge, erc20: erc20Connected },
      };
      return contracts;
    }, {});
  }

  public computeContract(config: SygmaBridgeSetup, connector: Connector) {
    const { bridgeAddress } = config;
    const erc20Address = config.tokens![this.selectedToken].address;

    const signer = connector.signer ?? connector.provider;

    const bridge = this.connectToBridge(bridgeAddress, signer!);
    const erc20 = this.connectERC20(erc20Address, signer!);
    return { bridge, erc20 };
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

  public createDepositEventListener(chain: Directions, userAddress: string): BridgeEventCallback {
    const bridge = this.bridges![chain]!;
    const depositFilter = bridge.filters.Deposit(null, null, null, userAddress, null, null);

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
    const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null);
    return bridge.removeAllListeners(depositFilter);
  }

  public async createHomeChainDepositEventListener(callback: any) {
    const signer = this.signers!['chain1'];
    const userAddress = await signer?.getAddress()
    return this.createDepositEventListener('chain1', userAddress!)(callback);
  }

  public removeHomeChainDepositEventListener() {
    const signer = this.signers!['chain1'];
    return this.removeDepositEventListener('chain1', signer);
  }

  public createProposalExecutionEventListener(chain: Directions, homeDepositNonce: number) {
    const destination = this.bridgeSetup[chain]
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);

    const proposalExecutionEventListener = (callbackFn: any) =>
      bridge.on(proposalFilter, (originDomainId, depositNonce, dataHash, tx) => {
        console.log("🚀 ~ file: Sygma.ts ~ line 306 ~ Sygma ~ createProposalExecutionEventListener ~ homeDepositNonce", homeDepositNonce)
        console.log("🚀 ~ file: Sygma.ts ~ line 312 ~ Sygma ~ bridge.on ~ depositNonce", depositNonce.toNumber())
        if (originDomainId === Number(destination.domainId) && depositNonce.toNumber() === homeDepositNonce) {
          callbackFn(originDomainId, depositNonce, dataHash, tx);
        }
      });

    return proposalExecutionEventListener;
  }

  public proposalExecutionEventListenerCount(chain: Directions) {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    const count = bridge.listenerCount(proposalFilter);
    return count;
  }

  public removeProposalExecutionEventListener(chain: Directions) {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    return bridge.removeAllListeners(proposalFilter);
  }

  public destinationProposalExecutionEventListener(homeDepositNonce: number, callback: any) {
    return this.createProposalExecutionEventListener('chain2', homeDepositNonce)(callback);
  }

  public removeDestinationProposalExecutionEventListener() {
    return this.removeProposalExecutionEventListener('chain2');
  }
  /**
   * @name deposit
   * @description make deposit between two networks
   * @param {object} argument
   * @param {string} params.amount
   * @param {string} params.recipientAddress receiver of the deposit
   * @param {string} params.feeData
   */
  public async deposit({
    amount,
    recipientAddress,
    feeData,
  }: {
    amount: string;
    recipientAddress: string;
    feeData: FeeDataResult;
  }) {
    const erc20ToUse = this.erc20!.chain1!;
    const provider = this.providers!.chain1;
    const bridgeToUse = this.bridges!.chain1!;
    const { erc20HandlerAddress } = this.bridgeSetup.chain1;
    const { domainId } = this.bridgeSetup.chain2;
    const resourceId = this.getSelectedToken().resourceId;

    return await this.erc20Bridge.transferERC20({
      amount,
      recipientAddress,
      erc20Intance: erc20ToUse,
      bridge: bridgeToUse,
      provider,
      erc20HandlerAddress,
      domainId,
      resourceId,
      feeData,
    });
  }

  /**
   * @name fetchFeeData
   * @description it fetches the fee data according to bridge setup
   * @param {object} params
   * @param {string} params.amount
   * @param {string} params.recipientAddress - receiver of the deposit
   * @param {string} params.overridedResourceId - matches local token in local setup with address of the token from where the price data is being fetched.
   * Only used when doing bridge with fee oracle service
   * @param {string} params.oraclePrivateKey
   */
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

  public async fetchBasicFeeData(params: { amount: string; recipientAddress: string }) {
    const { amount, recipientAddress } = params;
    const {
      feeSettings: { address: basicFeeHandlerAddress },
      domainId: fromDomainID,
    } = this.bridgeSetup.chain1;
    const { resourceId: resourceID } = this.getSelectedToken();
    const { domainId: toDomainID } = this.bridgeSetup.chain2;
    const provider = this.providers!.chain1!;
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
    if (!this.feeOracleSetup && !this.bridgeSetup.chain1.feeSettings.address) {
      console.log('No feeOracle config');
      return;
    }
    const { amount, recipientAddress, overridedResourceId, oraclePrivateKey } = params;
    const provider = this.providers!.chain1!;
    const { resourceId: resourceID } = this.getSelectedToken();
    const { address: feeOracleHandlerAddress } = this.bridgeSetup.chain1.feeSettings;
    const { feeOracleBaseUrl } = this.feeOracleSetup!;

    // We use sender address or zero because of contracts
    const sender = await this.signers!.chain1?.getAddress() ?? ethers.constants.AddressZero;

    const feeData = calculateFeeData({
      provider,
      sender,
      recipientAddress,
      fromDomainID: parseInt(this.bridgeSetup.chain1.domainId),
      toDomainID: parseInt(this.bridgeSetup.chain2.domainId),

      resourceID,
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
  /**
   * @name hasTokenSupplies
   * @description check if current token has supplies on destination chain
   * @param {number} amount
   * @returns {Promise} boolean value
   */
  public async hasTokenSupplies(amount: number): Promise<boolean> {
    const { erc20HandlerAddress, decimals } = this.bridgeSetup.chain2;
    const destinationTokenAddress = this.bridgeSetup.chain2.tokens![this.selectedToken].address;

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
  /**
   * @name checkCurrentAllowance
   * @description check the current allowance of the provided address
   * @param {string} recipientAddress
   */
  public async checkCurrentAllowance(recipientAddress: string) {
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
    const erc20Address = this.bridgeSetup[chain].tokens![this.selectedToken].address;
    const provider = this.providers![chain];
    const address = await this.getSignerAddress(chain);

    return await this.erc20Bridge.getTokenInfo(erc20Address, address!, provider);
  }

  public getSelectedTokenAddress() {
    return this.bridgeSetup.chain1.tokens[this.selectedToken].address;
  }

  public getSelectedToken() {
    return this.bridgeSetup.chain1.tokens[this.selectedToken];
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
  /**
   * @name approve
   * @description approve amount of tokens to spent on home chain
   * @param {object} argument
   * @param {string} params.amounForApproval
   */
  public async approve({ amounForApproval }: { amounForApproval: string }) {
    const amountForApprovalBN = utils.parseUnits(amounForApproval, 18);

    const gasPrice = await this.isEIP1559MaxFeePerGas('chain1');

    const erc20ToUse = this.erc20!.chain1!;
    const { erc20HandlerAddress } = this.bridgeSetup.chain1;

    return await this.erc20Bridge.approve(
      amountForApprovalBN,
      erc20ToUse,
      erc20HandlerAddress,
      gasPrice as BigNumber,
    );
  }

  public async checkCurrentAllowanceForFeeHandler(recipientAddress: string) {
    const erc20ToUse = this.erc20!.chain1!;
    const { address: erc20HandlerAddress } = this.bridgeSetup.chain1.feeSettings;

    return await this.erc20Bridge.checkCurrentAllowance(
      recipientAddress,
      erc20ToUse,
      erc20HandlerAddress,
    );
  }

  public async approveFeeHandler({ amounForApproval }: { amounForApproval: string }) {
    const amountForApprovalBN = utils.parseUnits(amounForApproval, 18);
    const gasPrice = await this.isEIP1559MaxFeePerGas('chain1');

    const erc20ToUse = this.erc20!.chain1!;
    const { address: erc20HandlerAddress } = this.bridgeSetup.chain1.feeSettings;

    return await this.erc20Bridge.approve(
      amountForApprovalBN,
      erc20ToUse,
      erc20HandlerAddress,
      gasPrice as BigNumber,
    );
  }
}
