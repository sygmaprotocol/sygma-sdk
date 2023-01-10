import { BigNumber, ethers, utils, Event, providers } from 'ethers';
import {
  Bridge,
  Bridge__factory as BridgeFactory,
  ERC721MinterBurnerPauser,
  ERC721MinterBurnerPauser__factory as Erc721Factory,
} from '@buildwithsygma/sygma-contracts';
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
  SygmaErc20Contracts as SygmaErcContracts,
  BridgeEventCallback,
  Directions,
  ConnectorSigner,
  ConnectorProvider,
  FeeOracleData,
  FeeDataResult,
  SygmaBridgeSetupList,
  SygmaBridgeSetup,
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
import { calculateBasicfee, calculateFeeData } from './fee';
import Connector from './connectors/Connectors';
import {
  createPermissionedGenericDepositData,
  createPermissionlessGenericDepositData,
  toHex,
} from './utils/helpers';

/**
 * @description Sygma is the main class that allows you to have bridging capabilities
 * with simple usage
 *
 */

export class Sygma implements SygmaSDK {
  public bridgeSetupList: SygmaBridgeSetupList | undefined;
  private ethersProvider: Provider = undefined;
  public bridgeSetup: BridgeData | undefined;
  public bridges: Bridges = { chain1: undefined, chain2: undefined };
  private signers: ConnectorSigner = { chain1: undefined, chain2: undefined };
  private tokens: SygmaErcContracts = { chain1: undefined, chain2: undefined };
  private providers: ConnectorProvider = { chain1: undefined, chain2: undefined };
  private currentBridge: EvmBridge;
  private feeOracleSetup?: FeeOracleData;
  public selectedToken: number = 0;

  public constructor({ bridgeSetupList, bridgeSetup, feeOracleSetup }: Setup) {
    this.bridgeSetupList = bridgeSetupList ?? undefined;
    this.bridgeSetup = bridgeSetup;
    this.currentBridge = EvmBridge.getInstance();
    this.feeOracleSetup = feeOracleSetup;
  }

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

  public selectHomeNetwork(homeNetworkChainId: number): SygmaBridgeSetup | undefined {
    return this.bridgeSetupList?.find(el => el.networkId === homeNetworkChainId);
  }

  public selectOneForDestination(homeNetworkChainId: number): SygmaBridgeSetup | undefined {
    return this.bridgeSetupList?.filter(el => el.networkId !== homeNetworkChainId)[0];
  }

  public initializeConnectionFromWeb3Provider(
    web3ProviderInstance: providers.ExternalProvider,
  ): Sygma {
    // @ts-ignore-line
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

  public async setHomeWeb3Provider(
    web3ProviderInstance: providers.ExternalProvider,
    domainId?: string,
  ): Promise<Sygma> {
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
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw `Cannot find network with chainId: ${network} in config`;
    }

    this.bridgeSetup!.chain1 = chain1;
    this.providers!.chain1 = connector.provider;
    this.signers!.chain1 = connector.signer;

    const contracts = this.computeContract(chain1, connector);
    this.tokens!['chain1'] = contracts.erc20;
    this.bridges!['chain1'] = contracts.bridge;

    return this;
  }

  public setDestination(domainId: string): Sygma {
    let chain2: SygmaBridgeSetup | undefined;
    if (domainId) {
      chain2 = this.bridgeSetupList!.find(el => el.domainId === domainId);
    }

    if (!chain2) {
      throw `Cannot find network with domainID: ${domainId} in config`;
    }

    this.bridgeSetup!.chain2 = chain2;

    const connector = setConnectorRPC(chain2.rpcUrl);

    this.providers!.chain2 = connector.provider;
    this.signers!.chain2 = connector.signer;

    const contracts = this.computeContract(chain2, connector);
    this.tokens!['chain2'] = contracts.erc20;
    this.bridges!['chain2'] = contracts.bridge;

    return this;
  }

  private computeContracts(): ChainbridgeContracts {
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

  public computeContract(
    config: SygmaBridgeSetup,
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

  private connectToBridge(bridgeAddress: string, signer: Signer | Provider): Bridge {
    return BridgeFactory.connect(bridgeAddress, signer!);
  }

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

  public removeDepositEventListener(chain: Directions): Bridge {
    const bridge = this.bridges![chain]!;
    const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null);
    return bridge.removeAllListeners(depositFilter);
  }

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

  public removeHomeChainDepositEventListener(): Bridge {
    return this.removeDepositEventListener('chain1');
  }

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

  public proposalExecutionEventListenerCount(chain: Directions): number {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    const count = bridge.listenerCount(proposalFilter);
    return count;
  }

  public removeProposalExecutionEventListener(chain: Directions): Bridge {
    const bridge = this.bridges![chain]!;
    const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
    return bridge.removeAllListeners(proposalFilter);
  }

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
   * @returns
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
  }): Promise<FeeDataResult | Error | undefined> {
    const { amount, overridedResourceId, oraclePrivateKey, recipientAddress } = params;
    const {
      feeSettings: { type },
    } = this.getSelectedToken();

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
  }): Promise<FeeDataResult | undefined> {
    if (!this.feeOracleSetup && !this.getSelectedToken().feeSettings.address) {
      console.log('No feeOracle config');
      return;
    }
    const { amount, recipientAddress, overridedResourceId, oraclePrivateKey } = params;
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
   * @returns {Promise} boolean value
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

  public async getAppoved(tokenId: string): Promise<boolean> {
    const tokenInstance = this.tokens!.chain1!;
    const { erc721HandlerAddress } = this.bridgeSetup!.chain1;

    return await this.currentBridge.getApproved(
      Number(tokenId),
      tokenInstance as ERC721MinterBurnerPauser,
      erc721HandlerAddress,
    );
  }

  public async isEIP1559MaxFeePerGas(from: Directions): Promise<boolean | BigNumber> {
    const provider = this.providers![from];

    return await this.currentBridge.isEIP1559MaxFeePerGas(provider);
  }

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

  public setSelectedToken(address: string): void {
    const token = this.bridgeSetup!.chain1.tokens.find(el => el.address === address);
    const tokenIdx = this.bridgeSetup!.chain1.tokens.indexOf(token!);
    const erc20Connected = this.connectToken(token!, this.signers?.chain1);
    this.tokens!.chain1 = erc20Connected;

    this.selectedToken = tokenIdx;
  }

  public getSelectedTokenAddress(): string {
    return this.bridgeSetup!.chain1.tokens[this.selectedToken].address;
  }

  public getSelectedToken(): TokenConfig {
    return this.bridgeSetup!.chain1.tokens[this.selectedToken];
  }

  public async getTokenBalance(erc20Contract: Erc20Detailed, address: string): Promise<BigNumber> {
    return await this.currentBridge.getERC20Balance(erc20Contract, address);
  }

  public async getSignerBalance(chain: string): Promise<BigNumber | undefined> {
    return await this.signers![chain as keyof BridgeData]?.getBalance();
  }

  public async getSignerAddress(chain: string): Promise<string | undefined> {
    return await this.signers![chain as keyof BridgeData]?.getAddress();
  }

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

  public async getDepositEventFromReceipt(depositTx: ethers.ContractReceipt): Promise<Event> {
    const bridgeContract = this.bridges!.chain1!;
    const depositFilter = bridgeContract.filters.Deposit();
    const events = await bridgeContract.queryFilter(depositFilter, depositTx.blockHash);
    const event = events[0];
    return event;
  }

  public async listErc721TokenIdsOfOwner(account: string): Promise<[string]> {
    const { address: token } = this.getSelectedToken();
    const signer = this.signers?.chain1!;
    return await listTokensOfOwner({ token, account, signer });
  }

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

  public formatPermissionedGenericDepositData(hexMetaData: string): string {
    const depositData = createPermissionedGenericDepositData(hexMetaData);

    return depositData;
  }

  public toHex(toConvert: string, padding: number): string {
    return toHex(toConvert, padding);
  }

  public getSigner(chain: string): Signer {
    return this.signers![chain as keyof BridgeData];
  }

  public getDestinationChainProvider(): ethers.providers.JsonRpcProvider {
    return this.providers!.chain2 as ethers.providers.JsonRpcProvider;
  }
}
