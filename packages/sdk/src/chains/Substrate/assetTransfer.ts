import { ApiPromise } from '@polkadot/api';
import {
  Environment,
  SubstrateConfig,
  SubstrateResource,
  Transfer,
  TransferType,
} from '../../types';
import { Config } from '../..';
import { SubstrateFee, getBasicFee } from '.';

export class SubstrateAssetTransfer {
  private apiPromise!: ApiPromise;
  private environment!: Environment;

  public config!: Config;

  public async init(apiPromise: ApiPromise, environment?: Environment): Promise<void> {
    this.apiPromise = apiPromise;
    this.environment = environment ? environment : Environment.MAINNET;
    this.config = new Config();
    await this.config.init(5, environment);
  }

  /**
   * Calculates fee required for the requested transfer.
   * Fee can be paid in native currency or ERC20 token if the 'tokenAddress'
   * is defined.
   *
   * @param transfer instance of transfer
   * @returns fee that needs to payed
   */
  public async getFee(): Promise<SubstrateFee> {
    const domainConfig = this.config.getDomainConfig() as SubstrateConfig;
    const fee = await getBasicFee(
      this.apiPromise,
      domainConfig.id,
      (domainConfig.resources[0] as SubstrateResource).xsmMultiAssetId,
    );

    return fee;
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
      `Resource type ${
        transfer.resource.type
      } with ${fee.fee.toString()} not supported by asset transfer`,
    );
  }
}
