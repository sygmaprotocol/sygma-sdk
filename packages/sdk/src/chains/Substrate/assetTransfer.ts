import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import {
  Environment,
  Fungible,
  ResourceType,
  SubstrateConfig,
  SubstrateResource,
  Transfer,
  TransferType,
} from '../../types';
import { Config } from '../..';
import { SubstrateFee, deposit, getBasicFee } from '.';

export class SubstrateAssetTransfer {
  private apiPromise!: ApiPromise;

  public config!: Config;

  public async init(
    apiPromise: ApiPromise,
    environment: Environment = Environment.MAINNET,
  ): Promise<void> {
    this.apiPromise = apiPromise;
    this.config = new Config();
    // TODO: Figure out which ChainId to pass in here
    await this.config.init(5, environment);
  }

  /**
   * Calculates fee required for the requested transfer.
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
   * @param transfer instance of transfer
   * @param fee
   * @returns unsigned transfer transaction
   */
  public buildTransferTransaction(
    transfer: Transfer<TransferType>,
    fee: SubstrateFee,
  ): SubmittableExtrinsic<'promise', SubmittableResult> {
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        return deposit(
          this.apiPromise,
          (transfer.resource as SubstrateResource).xsmMultiAssetId,
          (transfer.amount as Fungible).amount,
          transfer.to.id.toString(),
          transfer.recipient,
        );
      }
      default:
        throw new Error(
          `Resource type ${
            transfer.resource.type
          } with ${fee.fee.toString()} not supported by asset transfer`,
        );
    }
  }
}
