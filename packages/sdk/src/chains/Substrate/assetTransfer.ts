import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { U256 } from '@polkadot/types';
import { BN } from '@polkadot/util';
import {
  Environment,
  Fungible,
  ResourceType,
  SubstrateResource,
  Transfer,
  TransferType,
} from '../../types';
import { Config } from '../..';
import { BaseAssetTransfer } from '../BaseAssetTransfer';
import { SubstrateFee, deposit, getBasicFee } from '.';

/**
 * Class used for sending fungible and non-fungible transfers from Substrate based chains.
 *
 * @example
 * const wsProvider = new WsProvider('wss://rpc.parachain.io');
 * const api = await ApiPromise.create({ provider: wsProvider });
 *
 * const parachainID = 123;
 *
 * const assetTransfer = new SubstrateAssetTransfer();
 * await assetTransfer.init(api, Environment.MAINNET, parachainID);
 * const domains = assetTransfer.config.getDomains();
 * const resources = assetTransfer.config.getDomainResources();
 * const transfer: Transfer<Fungible> = {
 *  from: domains[1],
 *  to: domains[0],
 *  resource: resource[2],
 *  sender: <sender address>,
 *  recipient: <recipient address>,
 *  amount: {
 *    amount: 200
 *  }
 * }
 * const fee = await assetTransfer.getFee(transfer);
 * const transferTx = await assetTransfer.buildTransferTransaction(transfer, fee);
 *
 * <sign and send transfer>
 */
export class SubstrateAssetTransfer extends BaseAssetTransfer {
  private apiPromise!: ApiPromise;

  public async init(
    apiPromise: ApiPromise,
    environment: Environment = Environment.MAINNET,
  ): Promise<void> {
    this.apiPromise = apiPromise;
    const parachainId = apiPromise.consts.sygmaBridge.eip712ChainID as U256;
    this.environment = environment;

    this.config = new Config();
    // This is probably not too safe and might overflow
    await this.config.init(parachainId.toNumber(), environment);
  }

  /**
   * Calculates fee required for the requested transfer.
   *
   * @param transfer instance of transfer
   * @returns fee that needs to paid
   */
  public async getFee(transfer: Transfer<TransferType>): Promise<SubstrateFee> {
    const fee = await getBasicFee(
      this.apiPromise,
      transfer.to.id,
      (transfer.resource as SubstrateResource).xcmMultiAssetId,
    );

    return fee;
  }

  /**
   * Builds an unsigned transfer transaction.
   *
   * @param transfer Instance of transfer
   * @param fee The fee to be paid for the transfer
   * @returns {SubmittableExtrinsic<'promise', SubmittableResult>} SubmittableExtrinsic which can be signed and sent
   * @throws {Error} Transfer amount too low
   */
  public buildTransferTransaction(
    transfer: Transfer<TransferType>,
    fee: SubstrateFee,
  ): SubmittableExtrinsic<'promise', SubmittableResult> {
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        if (new BN((transfer.details as Fungible).amount).lt(fee.fee)) {
          throw new Error('Transfer amount should be higher than transfer fee');
        }

        return deposit(
          this.environment,
          this.apiPromise,
          (transfer.resource as SubstrateResource).xcmMultiAssetId,
          (transfer.details as Fungible).amount,
          transfer.to.id.toString(),
          (transfer.details as Fungible).recipient,
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
