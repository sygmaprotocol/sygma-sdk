import { BigNumber, ethers, utils, Event, providers } from 'ethers';
import {
  Bridge,
  Bridge__factory as BridgeFactory,
  ERC721MinterBurnerPauser,
  ERC721MinterBurnerPauser__factory as Erc721Factory,
} from '@buildwithsygma/sygma-contracts';
import { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';
import { Erc20DetailedFactory } from './Contracts/Erc20DetailedFactory';
import { Erc20Detailed } from './Contracts/Erc20Detailed';

import {
  SygmaSDK,
  Setup,
  BridgeData,
  SygmaContracts,
  Provider,
  Bridges,
  Signer,
  SygmaErc20Contracts as SygmaErcContracts,
  BridgeEventCallback,
  Directions,
  ConnectorSigner,
  ConnectorProvider,
  FeeOracleData,
  FeeDataResult,
  EvmBridgeSetupList,
  EvmBridgeSetup,
  TokenConfig,
} from './types';
import {
  computeBridges,
  computeERC20Contracts,
  computeProvidersAndSignersWeb3,
  computeProvidersAndSignersRPC,
  setConnectorWeb3,
  setConnectorRPC,
  listTokensOfOwner,
} from './utils';
import { EvmBridge } from './chains';
import { calculateBasicfee, calculateFeeData, getFeeHandlerAddress } from './fee';
import Connector from './connectors/Connectors';
import {
  createPermissionedGenericDepositData,
  createPermissionlessGenericDepositData,
  toHex,
} from './utils/helpers';

/**
 * @name Sygma
 * @description Sygma is the main class that allows you to have bridging capabilities
 * with simple usage
 *
 */
export class Sygma implements SygmaSDK {
  public bridgeSetupList: EvmBridgeSetupList | undefined;
  private ethersProvider: Provider = undefined;
  public bridgeSetup: BridgeData | undefined;
  public bridges: Bridges = { chain1: undefined, chain2: undefined };
  private signers: ConnectorSigner = { chain1: undefined, chain2: undefined };
  private tokens: SygmaErcContracts = { chain1: undefined, chain2: undefined };
  private providers: ConnectorProvider = { chain1: undefined, chain2: undefined };
  private currentBridge: EvmBridge;
  private feeOracleSetup?: FeeOracleData;
  public selectedToken: number = 0;

  /**
   * @name constructor
   * @param {Object} - bridge setup list in the form of array if you are connecting form browser or bridge setup object if you are using
   * the sdk with Node.js.
   * FeeOracle setup definition
   */
  public constructor({ bridgeSetupList, bridgeSetup, feeOracleSetup }: Setup) {
    this.bridgeSetupList = bridgeSetupList ?? undefined;
    this.bridgeSetup = bridgeSetup;
    this.currentBridge = EvmBridge.getInstance();
    this.feeOracleSetup = feeOracleSetup;
  }

  /**
   * @name initializeConnectionRPC
   * @description initializes RPC connection
   * @param address
   * @returns {Sygma}
   */
  public initializeConnectionRPC(address: string): Sygma {
    const providersAndSigners = computeProvidersAndSignersRPC(this.bridgeSetup!, address);
    this.providers = {
      chain1: providersAndSigners['chain1' as keyof BridgeData]
        .provider as ethers.providers.JsonRpcProvider,
      chain2: providersAndSigners['chain2' as keyof BridgeData]
        .provider as ethers.providers.JsonRpcProvider,
    };

    this.signers = {
      chain1: providersAndSigners['chain1' as keyof BridgeData].signer,
      chain2: providersAndSigners['chain2' as keyof BridgeData].signer,
    };

    const contracts = this.computeContracts();

    // setup erc20 contracts
    this.tokens = computeERC20Contracts(contracts);

    // setup bridges contracts
    this.bridges = computeBridges(contracts);

    return this;
  }

  /**
   * @name selectHomeNetwork
   * @description returns homechain object
   * @param homeNetworkChainId
   * @returns {EvmBridgeSetup | undefined}
   */
  public selectHomeNetwork(homeNetworkChainId: number): EvmBridgeSetup | undefined {
    return this.bridgeSetupList?.find(el => el.networkId === homeNetworkChainId);
  }

  /**
   * @name selectOneForDestination
   * @description returns the destinaton chain object
   * @param homeNetworkChainId
   * @returns {EvmBridgeSetup | undefined}
   */
  public selectOneForDestination(homeNetworkChainId: number): EvmBridgeSetup | undefined {
    return this.bridgeSetupList?.filter(el => el.networkId !== homeNetworkChainId)[0];
  }

  /**
   * @name initializeConnectionFromWeb3Provider
   * @description initializes the connection from web3 provider
   * @param web3ProviderInstance
   * @returns {Sygma}
   */
  public initializeConnectionFromWeb3Provider(
    web3ProviderInstance: providers.ExternalProvider,
  ): Sygma {
    // @ts-ignore-line
    const homeNetworkChainId = BigNumber.from(web3ProviderInstance.chainId).toNumber();
    this.bridgeSetup = {
      chain1: this.selectHomeNetwork(homeNetworkChainId)!,
      chain2: this.selectOneForDestination(homeNetworkChainId)!,
    };

    if (this.bridgeSetup.chain1.confirmations) {
      this.currentBridge.confirmations = this.bridgeSetup.chain1.confirmations;
    }

    const providersAndSigners = computeProvidersAndSignersWeb3(
      this.bridgeSetup,
      web3ProviderInstance,
    );

    this.providers = {
      chain1: providersAndSigners['chain1' as keyof BridgeData]
        .provider as ethers.providers.Web3Provider,
      chain2: providersAndSigners['chain2' as keyof BridgeData]
        .provider as ethers.providers.JsonRpcProvider,
    };

    this.signers = {
      chain1: providersAndSigners['chain1' as keyof BridgeData].signer,
      chain2: providersAndSigners['chain2' as keyof BridgeData].signer,
    };

    const contracts = this.computeContracts();

    // setup erc20 contracts
    this.tokens = computeERC20Contracts(contracts);

    // setup bridges contracts
    this.bridges = computeBridges(contracts);

    return this;
  }

  /**
   * @name setHomeWeb3Provider
   * @description set the web3 provider for homechain
   * @param web3ProviderInstance
   * @param domainId
   * @returns {Promise<Sygma>}
   */
  public async setHomeWeb3Provider(
    web3ProviderInstance: providers.ExternalProvider,
    domainId?: string,
  ): Promise<Sygma> {
    const connector = setConnectorWeb3(web3ProviderInstance);
    const network = await connector.provider?.getNetwork();
    let chain1: EvmBridgeSetup | undefined;
    // DomainId is used only for Local Setup
    if (domainId) {
      chain1 = this.bridgeSetupList!.find(el => el.domainId === domainId);
    } else {
      chain1 = this.bridgeSetupList!.find(el => Number(el.networkId) === network!.chainId);
    }

    if (!chain1) {
      throw `Cannot find network with chainId: ${network ? network.name : 'unknown'} in config`;
    }

    this.bridgeSetup!.chain1 = chain1;
    this.providers!.chain1 = connector.provider;
    this.signers!.chain1 = connector.signer;

    const contracts = this.computeContract(chain1, connector);
    this.tokens!['chain1'] = contracts.erc20;
    this.bridges!['chain1'] = contracts.bridge;

    return this;
  }

  /**
   * @name setDestination
   * @description set destination chain over the sygma instance
   * @param domainId
   * @returns {Sygma}
   */
  public setDestination(domainId: string): Sygma {
    let chain2: EvmBridgeSetup | undefined;
    if (domainId) {
      chain2 = this.bridgeSetupList!.find(el => el.domainId === domainId);
    }

    if (!chain2) {
      throw `Cannot find network with domainID: ${domainId} in config`;
    }
    this.bridgeSetup!.chain2 = chain2;

    // workaround too make work substrate as destination,
    // TODO: delete after #174
    if (chain2.type === 'Ethereum') {
      const connector = setConnectorRPC(chain2.rpcUrl);

      this.providers!.chain2 = connector.provider;
      this.signers!.chain2 = connector.signer;

      const contracts = this.computeContract(chain2, connector);
      this.tokens!['chain2'] = contracts.erc20;
      this.bridges!['chain2'] = contracts.bridge;

      if (this.bridgeSetup!.chain1.confirmations) {
        this.currentBridge.confirmations = this.bridgeSetup!.chain1.confirmations;
      }
    }

    return this;
  }

  /**
   * @name computeERC20Contracts
   * @description computes the sygma contracts
   * @returns {SygmaContracts}
   */
  private computeContracts(): SygmaContracts {
    return Object.keys(this.bridgeSetup!).reduce((contracts, chain) => {
      const { bridgeAddress } = this.bridgeSetup![chain as keyof BridgeData];
      const token = this.bridgeSetup![chain as keyof BridgeData].tokens[this.selectedToken];

      const signer =
        this.signers![chain as keyof BridgeData] ?? this.providers![chain as keyof BridgeData];

      const bridge = this.connectToBridge(bridgeAddress, signer);
      const tokenConnected = this.connectToken(token, signer);
      contracts = {
        ...contracts,
        [chain]: { bridge, erc20: tokenConnected },
      };
      return contracts;
    }, {});
  }

  /**
   * @name computeContract
   * @description returns bridge and ERC20 contracts
   * @param config - Sygma bridge config
   * @param connector - connector object
   * @returns {Object} - object with bridge and ERC20 contracts
   */
  public computeContract(
    config: EvmBridgeSetup,
    connector: Connector,
  ): {
    bridge: Bridge;
    erc20: Erc20Detailed | ERC721MinterBurnerPauser;
  } {
    const { bridgeAddress } = config;
    const token = config.tokens[this.selectedToken];

    const signer = connector.signer ?? connector.provider;

    const bridge = this.connectToBridge(bridgeAddress, signer);
    const erc20 = this.connectToken(token, signer);

    return { bridge, erc20 };
  }

  /**
   * @name connectToBridge
   * @description establish connetion with bridge contract interfacep
   * @param bridgeAddress
   * @param signer
   * @returns {Bridge}
   */
  private connectToBridge(bridgeAddress: string, signer: Signer | Provider): Bridge {
    return BridgeFactory.connect(bridgeAddress, signer!);
  }

  /**
   * @name connectToken
   * @description connects to token
   * @param token
   * @param signer
   * @returns {Erc20Detailed | ERC721MinterBurnerPauser}
   */
  private connectToken(
    token: TokenConfig,
    signer: ethers.providers.JsonRpcSigner | Provider,
  ): Erc20Detailed | ERC721MinterBurnerPauser {
    const connectors = {
      erc20: () => Erc20DetailedFactory.connect(token.address, signer!),
      erc721: () => Erc721Factory.connect(token.address, signer!),
    };
    return connectors[token.type]();
  }

  /**
   * @name createDepositEventListener
   * @description creates the deposit events and returns the callback to use
   * @param chain
   * @param userAddress
   * @returns {BridgeEventCallback}
   */
  public createDepositEventListener(chain: Directions, userAddress: string): BridgeEventCallback {
    const bridge = this.bridges![chain]!;
    const depositFilter = bridge.filters.Deposit(null, null, null, userAddress, null, null);

    const depositEventListner = (
      callbackFn: (
        destinationDomainId: number,
        resourceId: string,
        depositNonce: BigNumber,
        user: string,
        data: string,
        handleResponse: string,
        tx: Event,
      ) => void,
    ): Bridge =>
      bridge.once(
        depositFilter,
        (destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx) => {
          callbackFn(destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx);
        },
      );

    return depositEventListner;
  }

  /**
   * @name removeDepositEventListener
   * @description remove the deposit event
   * @param chain
   * @returns {Bridge}
   */
  public removeDepositEventListener(chain: Directions): Bridge {
    const bridge = this.bridges![chain]!;
    const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null);
    return bridge.removeAllListeners(depositFilter);
  }

  /**
   * @name createHomeChainDepositEventListener
   * @description creates the homechain deposit event listener
   * @param callback
   * @returns {Promise<Bridge>}
   */
  public async createHomeChainDepositEventListener(
    callback: (
      destinationDomainId: number,
      resourceId: string,
      depositNonce: BigNumber,
      user: string,
      data: string,
      handleResponse: string,
      tx: Event,
    ) => void,
  ): Promise<Bridge> {
    const signer = this.signers!['chain1'];
    const userAddress = await signer?.getAddress();
    return this.createDepositEventListener('chain1', userAddress!)(callback);
  }

  /**
   * @name removeHomeChainDepositEventListener
   * @description removes the homechain deposit event listener
   * @returns {Bridge}
   */
  public removeHomeChainDepositEventListener(): Bridge {
    return this.removeDepositEventListener('chain1');
  }

  /**
   * @name createProposalExecutionEventListener
   * @description creates the event for proposal execution and returns the callback to use
   * @param chain
   * @param homeDepositNonce
   * @returns {BridgeEventCallback}
   */
  public createProposalExecutionEventListener(
    chain: Directions,
    homeDepositNonce: number,
  ): BridgeEventCallback {
    const destination = this.bridgeSetup![chain];
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);

    const proposalExecutionEventListener = (
      callbackFn: (
        originDomainId: number,
        depositNonce: BigNumber,
        dataHash: string,
        tx: Event,
      ) => void,
    ): Bridge =>
      bridge.on(proposalFilter, (originDomainId, depositNonce, dataHash, tx) => {
        console.log(originDomainId, destination.domainId, depositNonce, homeDepositNonce);
        if (depositNonce.toNumber() === homeDepositNonce) {
          callbackFn(originDomainId, depositNonce, dataHash, tx);
        }
      });

    return proposalExecutionEventListener;
  }

  /**
   * @name proposalExecutionEventListenerCount
   * @description computes the amount of listeners
   * @param chain
   * @returns {number}
   */
  public proposalExecutionEventListenerCount(chain: Directions): number {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    const count = bridge.listenerCount(proposalFilter);
    return count;
  }

  /**
   * @name removeProposalExecutionEventListener
   * @description removes the proposal execution listener
   * @param chain
   * @returns {Bridge}
   */
  public removeProposalExecutionEventListener(chain: Directions): Bridge {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    return bridge.removeAllListeners(proposalFilter);
  }

  /**
   * @name destinationProposalExecutionEventListener
   * @description returns the proposal execution listener
   * @param homeDepositNonce
   * @param callback
   * @returns {Bridge}
   */
  public destinationProposalExecutionEventListener(
    homeDepositNonce: number,
    callback: (
      originDomainId: number,
      depositNonce: BigNumber,
      dataHash: string,
      tx: Event,
    ) => void,
  ): Bridge {
    return this.createProposalExecutionEventListener('chain2', homeDepositNonce)(callback);
  }

  /**
   * @name removeDestinationProposalExecutionEventListener
   * @description removes the destination proposal execution listener
   * @returns {Bridge}
   */
  public removeDestinationProposalExecutionEventListener(): Bridge {
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
  }): Promise<ethers.ContractReceipt | undefined> {
    const erc20ToUse = this.tokens!.chain1!;
    const provider = this.providers!.chain1;
    const bridgeToUse = this.bridges!.chain1!;
    const { erc20HandlerAddress, erc721HandlerAddress } = this.bridgeSetup!.chain1;
    const { domainId } = this.bridgeSetup!.chain2;
    const token = this.getSelectedToken();
    const resourceId = this.getSelectedToken().resourceId;

    return await this.currentBridge.transfer({
      tokenType: token.type,
      amount,
      recipientAddress,
      tokenInstance: erc20ToUse,
      bridge: bridgeToUse,
      provider,
      handlerAddress: token.type === 'erc721' ? erc721HandlerAddress : erc20HandlerAddress,
      domainId,
      resourceId,
      feeData,
    });
  }

  /**
   * @name depositGeneric
   * @description call generic handler to achieve general message passing
   * @param {string} resourceId
   * @param {string} depositData
   * @param {string} fee
   * @returns {Promise<ethers.ContractReceipt | undefined>}
   */
  public async depositGeneric(
    resourceId: string,
    depositData: string,
    fee: FeeDataResult,
  ): Promise<ethers.ContractReceipt | undefined> {
    const { domainId } = this.bridgeSetup!.chain2;
    const provider = this.providers!.chain1;
    const bridgeToUse = this.bridges!.chain1!;

    return await this.currentBridge.depositGeneric({
      domainId,
      resourceId,
      depositData,
      fee,
      bridge: bridgeToUse,
      provider,
    });
  }

  /**
   * @name fetchFeeData
   * @description it fetches the fee data according to bridge setup
   * @param {object} params
   * @param {string} params.amount - the amount of token to transfer
   * @param {string} params.recipientAddress - receiver of the deposit
   */
  public async fetchFeeData(params: {
    amount: string;
    recipientAddress: string;
  }): Promise<FeeDataResult | Error | undefined> {
    const { amount, recipientAddress } = params;
    console.log('🚀 ~ file: Sygma.ts:567 ~ Sygma ~ recipientAddress:', recipientAddress);
    const {
      feeSettings: { type },
    } = this.getSelectedToken();

    console.warn('fee settings', this.getSelectedToken());

    if (type === 'none') {
      console.warn('No fee settings provided');
      return;
    }

    if (type !== 'basic' && this.feeOracleSetup?.feeOracleBaseUrl !== undefined) {
      return await this.fetchFeeOracleData({
        amount,
        recipientAddress,
      });
    } else {
      return await this.fetchBasicFeeData({
        amount,
        recipientAddress,
      });
    }
  }

  /**
   * @name fetchBasicFeeData
   * @description fetch the basic fee data from FeeOracle service
   * @param {object} - amount and recipient address to fetch basic fee data
   * @returns {Promise<FeeDataResult | Error>}
   */
  public async fetchBasicFeeData(params: {
    amount: string;
    recipientAddress: string;
  }): Promise<FeeDataResult | Error> {
    const { amount, recipientAddress } = params;
    const { domainId: fromDomainID } = this.bridgeSetup!.chain1;
    const {
      feeSettings: { address: basicFeeHandlerAddress },
    } = this.getSelectedToken();
    const { resourceId: resourceID } = this.getSelectedToken();
    const { domainId: toDomainID } = this.bridgeSetup!.chain2;
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
        tokenAmount: amount,
        recipientAddress,
      });

      return basicFee;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * @name fetchFeeOracleData
   * @description fetch the fee oracle data from FeeOracle service
   * @param {object}
   * @returns {Promise<FeeDataResult | undefined>}
   */
  private async fetchFeeOracleData(params: {
    amount: string;
    recipientAddress: string;
  }): Promise<FeeDataResult | undefined> {
    if (!this.feeOracleSetup && !this.getSelectedToken().feeSettings.address) {
      console.log('No feeOracle config');
      return;
    }
    const { amount, recipientAddress } = params;
    const provider = this.providers!.chain1!;
    const {
      resourceId: resourceID,
      feeSettings: { address: feeOracleHandlerAddress },
    } = this.getSelectedToken();
    const { feeOracleBaseUrl } = this.feeOracleSetup!;

    // We use sender address or zero because of contracts
    const sender = (await this.signers!.chain1?.getAddress()) ?? ethers.constants.AddressZero;

    const feeData = calculateFeeData({
      provider,
      sender,
      recipientAddress,
      fromDomainID: parseInt(this.bridgeSetup!.chain1.domainId),
      toDomainID: parseInt(this.bridgeSetup!.chain2.domainId),
      resourceID,
      tokenAmount: amount,
      feeOracleBaseUrl,
      feeOracleHandlerAddress,
    });

    return feeData;
  }

  /**
   * @name waitForTransactionReceipt
   * @description waits one block for tx receipt
   * @param txHash
   * @returns {Promise<ethers.providers.TransactionReceipt | undefined>}
   */
  public async waitForTransactionReceipt(
    txHash: string,
  ): Promise<ethers.providers.TransactionReceipt | undefined> {
    const receipt = await this.ethersProvider?.waitForTransaction(txHash, 1);
    return receipt;
  }

  /**
   * @name hasTokenSupplies
   * @description check if current token has supplies on destination chain
   * @param {number} amount
   * @returns {Promise<boolean>} boolean value
   */
  public async hasTokenSupplies(amount: number): Promise<boolean> {
    const { erc20HandlerAddress, decimals } = this.bridgeSetup!.chain2;
    const destinationTokenAddress = this.bridgeSetup!.chain2.tokens[this.selectedToken].address;

    const provider = this.providers!.chain2;

    const hasTokenSupplies = await this.currentBridge.hasTokenSupplies(
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
  public async checkCurrentAllowance(recipientAddress: string): Promise<number> {
    const erc20ToUse = this.tokens!.chain1!;
    const { erc20HandlerAddress } = this.bridgeSetup!.chain1;

    return await this.currentBridge.checkCurrentAllowance(
      recipientAddress,
      erc20ToUse as Erc20Detailed,
      erc20HandlerAddress,
    );
  }

  /**
   * @name getApproved
   * @description returns true if there is an approval over the specified token id
   * @param tokenId
   * @returns {Promise<boolean>}
   */
  public async getAppoved(tokenId: string): Promise<boolean> {
    const tokenInstance = this.tokens!.chain1!;
    const { erc721HandlerAddress } = this.bridgeSetup!.chain1;

    return await this.currentBridge.getApproved(
      Number(tokenId),
      tokenInstance as ERC721MinterBurnerPauser,
      erc721HandlerAddress,
    );
  }

  /**
   * @name isEIP1559MaxFeePerGas
   * @description check if node is EIP1559
   * @param from
   * @returns {Promise<boolean | BigNumber>}
   */
  public async isEIP1559MaxFeePerGas(from: Directions): Promise<boolean | BigNumber> {
    const provider = this.providers![from];

    return await this.currentBridge.isEIP1559MaxFeePerGas(provider);
  }

  /**
   * @name getTokenInfo
   * @description gets token info from one chain
   * @param chain
   * @returns {Promise<object>}
   */
  public async getTokenInfo(chain: Directions): Promise<{
    balanceOfTokens: BigNumber;
    tokenName: string;
  }> {
    const erc20Address = this.bridgeSetup![chain].tokens[this.selectedToken].address;
    const provider = this.providers![chain];
    const address = await this.getSignerAddress(chain);
    if (this.getSelectedToken().type === 'erc20') {
      return await this.currentBridge.getErc20TokenInfo(erc20Address, address!, provider);
    } else {
      return await this.currentBridge.getErc721TokenInfo(erc20Address, address!, provider);
    }
  }

  /**
   * @name setSelectedToken
   * @description sets the selectedToken in the Sygma instancep
   * @param address
   * @returns {void}
   */
  public setSelectedToken(address: string): void {
    const token = this.bridgeSetup!.chain1.tokens.find(el => el.address === address);
    const tokenIdx = this.bridgeSetup!.chain1.tokens.indexOf(token!);
    const erc20Connected = this.connectToken(token!, this.signers?.chain1);
    this.tokens!.chain1 = erc20Connected;

    this.selectedToken = tokenIdx;
  }

  /**
   * @name getSelectedTokenAddress
   * @returns {string}
   */
  public getSelectedTokenAddress(): string {
    return this.bridgeSetup!.chain1.tokens[this.selectedToken].address;
  }

  /**
   * @name getSelectedToken
   * @returns {TokenConfig}
   */
  public getSelectedToken(): TokenConfig {
    return this.bridgeSetup!.chain1.tokens[this.selectedToken];
  }

  /**
   * @name getTokenBalance
   * @description returns ERC20 token balance
   * @param erc20Contract
   * @param address
   * @returns {Promise<BigNumber>}
   */
  public async getTokenBalance(erc20Contract: Erc20Detailed, address: string): Promise<BigNumber> {
    return await this.currentBridge.getERC20Balance(erc20Contract, address);
  }

  /**
   * @name getSignerBalance
   * @description gets the signer balance
   * @param chain
   * @returns {Promise<BigNumber | undefined>}
   */
  public async getSignerBalance(chain: string): Promise<BigNumber | undefined> {
    return await this.signers![chain as keyof BridgeData]?.getBalance();
  }

  /**
   * @name getSignerAddress
   * @param chain
   * @returns {Promise<string | undefined>}
   */
  public async getSignerAddress(chain: string): Promise<string | undefined> {
    return await this.signers![chain as keyof BridgeData]?.getAddress();
  }

  /**
   * @name getSignerGasPrice
   * @param chain
   * @returns {Promise<BigNumber | undefined>}
   */
  public async getSignerGasPrice(chain: string): Promise<BigNumber | undefined> {
    return await this.signers![chain as keyof BridgeData]?.getGasPrice();
  }

  /**
   * @name approve
   * @description approve amount of tokens to spent on home chain
   * @param {object} argument
   * @param {string} params.amounForApproval
   */
  public async approve({
    amountOrIdForApproval,
  }: {
    amountOrIdForApproval: string;
  }): Promise<ethers.ContractReceipt | undefined> {
    const selectedToken = this.getSelectedToken();

    const amountForApprovalBN =
      selectedToken.type === 'erc20'
        ? utils.parseUnits(amountOrIdForApproval, 18)
        : BigNumber.from(amountOrIdForApproval);

    const gasPrice = await this.isEIP1559MaxFeePerGas('chain1');

    const erc20ToUse = this.tokens!.chain1!;
    const { erc20HandlerAddress, erc721HandlerAddress } = this.bridgeSetup!.chain1;

    const handlerAddress =
      selectedToken.type === 'erc20' ? erc20HandlerAddress : erc721HandlerAddress;

    return await this.currentBridge.approve(
      amountForApprovalBN,
      erc20ToUse,
      handlerAddress,
      gasPrice as BigNumber,
    );
  }

  /**
   * @name checkCurrentAllowanceForFeeHandler
   * @param recipientAddress
   * @returns {Promise<number>}
   */
  public async checkCurrentAllowanceForFeeHandler(recipientAddress: string): Promise<number> {
    const erc20ToUse = this.tokens!.chain1!;
    const {
      feeSettings: { address: erc20HandlerAddress },
    } = this.getSelectedToken();

    return await this.currentBridge.checkCurrentAllowance(
      recipientAddress,
      erc20ToUse as Erc20Detailed,
      erc20HandlerAddress,
    );
  }

  /**
   * @name approveFeeHandler
   * @description approves to the fee handler
   * @param {object}
   * @returns {Promise<ethers.ContractReceipt | undefined>}
   */
  public async approveFeeHandler({
    amounForApproval,
  }: {
    amounForApproval: string;
  }): Promise<ethers.ContractReceipt | undefined> {
    const amountForApprovalBN = utils.parseUnits(amounForApproval, 18);
    const gasPrice = await this.isEIP1559MaxFeePerGas('chain1');

    const erc20ToUse = this.tokens!.chain1!;
    const {
      feeSettings: { address: erc20HandlerAddress },
    } = this.getSelectedToken();

    return await this.currentBridge.approve(
      amountForApprovalBN,
      erc20ToUse,
      erc20HandlerAddress,
      gasPrice as BigNumber,
    );
  }

  /**
   * @name getDepositEventFromReceipt
   * @param depositTx
   * @returns {Promise<DepositEvent>}
   */
  public async getDepositEventFromReceipt(
    depositTx: ethers.ContractReceipt,
  ): Promise<DepositEvent> {
    const bridgeContract = this.bridges!.chain1!;
    const depositFilter = bridgeContract.filters.Deposit();
    const events = await bridgeContract.queryFilter(depositFilter, depositTx.blockHash);
    const event = events[0];
    return event;
  }

  /**
   * @name listErc721TokenIdsOfOwner
   * @description list the tokens from the owner
   * @param account
   * @returns {Promise<[string]>}
   */
  public async listErc721TokenIdsOfOwner(account: string): Promise<[string]> {
    const { address: token } = this.getSelectedToken();
    const signer = this.signers?.chain1!;
    return await listTokensOfOwner({ token, account, signer });
  }

  /**
   * @name formatPermissionlessGenericDepositData
   * @description formats the data for the permissionaless handler
   * @param executeFunctionSignature
   * @param executeContractAddress
   * @param maxFee
   * @param depositor
   * @param executionData
   * @param depositorCheck
   * @returns {string}
   */
  public formatPermissionlessGenericDepositData(
    executeFunctionSignature: string,
    executeContractAddress: string,
    maxFee: string,
    depositor: string,
    executionData: string,
    depositorCheck: boolean = true,
  ): string {
    const depositData = createPermissionlessGenericDepositData(
      executeFunctionSignature,
      executeContractAddress,
      maxFee,
      depositor,
      executionData,
      depositorCheck,
    );

    return depositData;
  }

  /**
   * @name formatPermissionedGenericDepositData
   * @description formats the data for the permissioned generic data
   * @param hexMetaData
   * @returns {string}
   */
  public formatPermissionedGenericDepositData(hexMetaData: string): string {
    const depositData = createPermissionedGenericDepositData(hexMetaData);

    return depositData;
  }

  /**
   * @name toHex
   * @description returns formatted hex data
   * @param toConvert
   * @param padding
   * @returns {string}
   */
  public toHex(toConvert: string, padding: number): string {
    return toHex(toConvert, padding);
  }

  /**
   * @name getSigner
   * @param chain
   * @returns {Signer}
   */
  public getSigner(chain: string): Signer {
    return this.signers![chain as keyof BridgeData];
  }

  /**
   * @name getDestinationChainProvider
   * @description returns the RPC provider for destination chain
   * @returns {ethers.providers.JsonRpcProvider}
   */
  public getDestinationChainProvider(): ethers.providers.JsonRpcProvider {
    return this.providers!.chain2 as ethers.providers.JsonRpcProvider;
  }

  /**
   * @name getFeeRouterAddress
   * @param chain - the chain to get the fee router address
   * @returns {string} - the address of the fee router
   */
  public getFeeRouterAddress(chain: 'chain1' | 'chain2'): string {
    const { feeRouterAddress } = this.bridgeSetup![chain as keyof BridgeData];
    return feeRouterAddress;
  }

  /**
   * @name getBridgeSetup
   * @param chain - chain to select to return the configuration that was passed on intiantiation
   * @returns {EvmBridgeSetup} - the current configuration for that chain
   */
  public getBridgeSetup(chain: 'chain1' | 'chain2'): EvmBridgeSetup {
    return this.bridgeSetup![chain as keyof BridgeData];
  }

  /**
   * @name setFeeSettings
   * @param type - the fee settings type: current options are oracle or basic
   * @param address - address of the fee handler
   * @param tokenAddress - the token on which the fee settings are being set
   * @param chain - the chain on which the token is going to be altered
   */
  public setFeeSettings(
    type: string,
    address: string,
    tokenAddress: string,
    chain: 'chain1' | 'chain2',
  ): void {
    const tokenFound = this.bridgeSetup![chain as keyof BridgeData].tokens.find(
      token => token.address === tokenAddress,
    );

    const tokenUpdate = {
      ...tokenFound,
      feeSettings: { type, address },
    };

    this.bridgeSetup![chain as keyof BridgeData].tokens = this.bridgeSetup![
      chain as keyof BridgeData
    ].tokens.map(token => {
      if (token.address === tokenFound?.address) {
        return tokenUpdate;
      }
      return token;
    }) as TokenConfig[];
  }

  public async getFeeHandlerAddress(
    signerOrProvider: ethers.providers.JsonRpcProvider | ethers.Signer,
    feeRouterAddress: string,
    domainId: string,
    resourceId: string,
  ): Promise<string | Error> {
    try {
      const feeHandlerAddress = await getFeeHandlerAddress(
        signerOrProvider,
        feeRouterAddress,
        domainId,
        resourceId,
      );
      return feeHandlerAddress;
    } catch (error) {
      console.error("Couldn't get fee handler address", error);
      return error as Error;
    }
  }
}
