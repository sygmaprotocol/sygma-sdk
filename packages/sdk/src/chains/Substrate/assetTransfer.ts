import { ApiPromise } from '@polkadot/api';
import {
  Environment,
  EthereumConfig,
  FeeHandlerType,
  Fungible,
  NonFungible,
  ResourceType,
  SubstrateConfig,
  Transfer,
  TransferType,
} from '../../types';
import { Config } from '../..';
import { getFeeOracleBaseURL } from '../../utils';
import { SubstrateFee, getBasicFee } from '.';
import { BigNumber } from 'ethers';

export class SubstrateAssetTransfer {
  private apiPromise!: ApiPromise;
  private environment!: Environment;

  public config!: Config;

  public async init(apiPromise: ApiPromise, environment?: Environment): Promise<void> {
    this.apiPromise = apiPromise;
    this.environment = environment ? environment : Environment.MAINNET;
    this.config = new Config();
    // TODO: Figure out what ChainId to pass in here
    await this.config.init(1, environment);
  }

  /**
   * Calculates fee required for the requested transfer.
   * Fee can be paid in native currency or ERC20 token if the 'tokenAddress'
   * is defined.
   *
   * @param transfer instance of transfer
   * @returns fee that needs to payed
   */
  public async getFee(transfer: Transfer<TransferType>): Promise<SubstrateFee> {
    // TODO: Wire up this function
    const domainConfig = this.config.getDomainConfig() as SubstrateConfig;
    const fee = await getBasicFee(
      this.apiPromise,
      domainConfig.id,
      domainConfig.resources[0].xsmMultiAssetId || {},
    );
    return fee
  }

  /**
   * Builds unsigned transfer transaction.
   * Should be executed after the approval transactions.
   *
   * @param transfer
   * @param fee
   * @returns unsigned transfer transaction
   */
  public async buildTransferTransaction(
    transfer: Transfer<TransferType>,
    fee: SubstrateFee,
  ): Promise<any /* Fix this type */> {


    throw new Error(
      `Resource type ${transfer.resource.type} with ${fee.fee.toString()} not supported by asset transfer`,
    );
  }
}
