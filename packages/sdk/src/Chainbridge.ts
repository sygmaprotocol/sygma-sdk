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
} from './types';
import {
  computeBridgeEvents,
  computeBridges,
  computeERC20Contracts,
  computeProvidersAndSigners,
} from './utils';
import { ERC20Bridge } from './chains';
import { calculateBasicfee, calculateFeeData } from './fee';

/**
 * Chainbridge is the main class that allows you to have bridging capabilities
 * with simple usage
 *
 */

export class Chainbridge implements ChainbridgeSDK {
  private ethersProvider: Provider = undefined;
  private bridgeSetup: BridgeData;
  private bridges: Bridges = undefined;
  public bridgeEvents: Events = undefined;
  private signers: ConnectorSigner = undefined;
  private erc20: ChainbridgeErc20Contracts = undefined;
  private providers: ConnectorProvider = undefined;
  private erc20Bridge: ERC20Bridge;
  private feeOracleSetup?: FeeOracleData;

  public constructor({ bridgeSetup, feeOracleSetup }: Setup) {
    this.bridgeSetup = bridgeSetup;
    this.erc20Bridge = ERC20Bridge.getInstance();
    this.feeOracleSetup = feeOracleSetup;
  }

  public async initializeConnection(address?: string): Promise<ConnectionEvents> {
    const providersAndSigners = computeProvidersAndSigners(this.bridgeSetup, address);

    if (!address) {
      this.providers = {
        chain1: providersAndSigners!['chain1' as keyof BridgeData]
          .provider as ethers.providers.Web3Provider,
        chain2: providersAndSigners!['chain2' as keyof BridgeData]
          .provider as ethers.providers.Web3Provider,
      };
    } else {
      this.providers = {
        chain1: providersAndSigners!['chain1' as keyof BridgeData]
          .provider as ethers.providers.JsonRpcProvider,
        chain2: providersAndSigners!['chain2' as keyof BridgeData]
          .provider as ethers.providers.JsonRpcProvider,
      };
    }

    this.signers = {
      chain1: providersAndSigners!['chain1' as keyof BridgeData].signer,
      chain2: providersAndSigners!['chain2' as keyof BridgeData].signer,
    };

    const contracts = this.computeContracts();
    // console.log("🚀 ~ file: Chainbridge.ts ~ line 77 ~ Chainbridge ~ initializeConnection ~ contracts", contracts)

    // this returns bridge events object
    this.bridgeEvents = computeBridgeEvents(contracts);

    // setup erc20 contracts
    this.erc20 = computeERC20Contracts(contracts);

    // setup bridges contracts
    this.bridges = computeBridges(contracts);

    const feeHandlerByNetwork = await this.checkFeeHandlerByNetwork(contracts);

    return {
      chain1: {
        bridgeEvents: this.bridgeEvents?.chain1?.bridgeEvents!,
        proposalEvents: this.bridgeEvents?.chain1?.proposalEvents,
        voteEvents: this.bridgeEvents?.chain1?.voteEvents,
        feeHandler: feeHandlerByNetwork.chain1,
      },
      chain2: {
        bridgeEvents: this.bridgeEvents?.chain2?.bridgeEvents!,
        proposalEvents: this.bridgeEvents?.chain2?.proposalEvents,
        voteEvents: this.bridgeEvents?.chain2?.voteEvents,
        feeHandler: feeHandlerByNetwork.chain2,
      },
    };
  }

  private computeContracts(): ChainbridgeContracts {
    return Object.keys(this.bridgeSetup).reduce((contracts: any, chain) => {
      const { bridgeAddress, erc20Address } = this.bridgeSetup[chain as keyof BridgeData];

      const signer = this.signers![chain as keyof BridgeData];

      const bridge = this.connectToBridge(bridgeAddress, signer!);
      // console.log("bridge fee", await this.checkFeeHandlerOnBridge(bridge))
      const bridgeEvent = this.getBridgeDepositEvents(bridge, signer);
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

  public async deposit(
    amount: string,
    recipientAddress: string,
    from: Directions,
    to: Directions,
    feeData: string,
  ) {
    const erc20ToUse = this.erc20![from];
    const provider = this.providers![from];
    const bridgeToUse = this.bridges![from];
    const { erc20HandlerAddress } = this.bridgeSetup[from];
    const { domainId, erc20ResourceID } = this.bridgeSetup[to];

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

  public async fetchBasicFeeData(
    amount: string,
    recipientAddress: string,
    from: Directions,
    to: Directions,
  ) {
    const { feeSettings: { address: basicFeeHandlerAddress }, domainId: fromDomainID, erc20ResourceID: resourceID } = this.bridgeSetup[from as keyof BridgeData]
    const { domainId: toDomainID } = this.bridgeSetup[to as keyof BridgeData]
    const provider = this.providers![from]!
    const sender = this.signers![from]?._address!

    try {
      const basicFee = await calculateBasicfee({
        basicFeeHandlerAddress,
        provider,
        sender,
        fromDomainID,
        toDomainID,
        resourceID,
        tokenAmount: Number(amount),
        recipientAddress
      })

      return basicFee
    } catch(error){
      return error
    }
  }

  public async fetchFeeOracleData(params: {
    amount: string;
    recipientAddress: string;
    from: Directions;
    to: Directions;
    overridedResourceId?: string;
    oraclePrivateKey?: string;
  }) {
    if (
      !this.feeOracleSetup &&
      this.bridgeSetup[params.from as keyof BridgeData].feeOracleHandlerAddress
    ) {
      console.log('No feeOracle config');
      return;
    }
    const { amount, recipientAddress, from, to, overridedResourceId, oraclePrivateKey } = params;
    const provider = this.providers![from]!;
    const { erc20Address, feeOracleHandlerAddress } = this.bridgeSetup[from];
    const { feeOracleBaseUrl } = this.feeOracleSetup!;

    // We use sender address or zero because of contracts
    const sender = this.signers![from]?._address ?? ethers.constants.AddressZero;

    const feeData = calculateFeeData({
      provider,
      sender,
      recipientAddress,
      fromDomainID: parseInt(this.bridgeSetup[from].domainId),
      toDomainID: parseInt(this.bridgeSetup[to].domainId),
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

  public async hasTokenSupplies(amount: number, to: Directions): Promise<boolean> {
    const {
      erc20Address: destinationTokenAddress,
      erc20HandlerAddress,
      decimals,
    } = this.bridgeSetup[to];
    const provider = this.providers![to];

    const hasTokenSupplies = await this.erc20Bridge.hasTokenSupplies(
      amount,
      to,
      provider,
      destinationTokenAddress,
      erc20HandlerAddress,
      decimals,
    );

    return hasTokenSupplies;
  }

  public async checkCurrentAllowance(from: Directions, recipientAddress: string) {
    const erc20ToUse = this.erc20![from];
    const { erc20HandlerAddress } = this.bridgeSetup[from];

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

  public async approve(amounForApproval: string, from: Directions) {
    const amountForApprovalBN = utils.parseUnits(amounForApproval, 18);

    const gasPrice = await this.isEIP1559MaxFeePerGas(from);

    const erc20ToUse = this.erc20![from];
    const { erc20HandlerAddress } = this.bridgeSetup[from];

    return await this.erc20Bridge.approve(
      amountForApprovalBN,
      erc20ToUse,
      erc20HandlerAddress,
      gasPrice as BigNumber,
    );
  }
}
