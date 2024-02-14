import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { U256 } from '@polkadot/types';
import { BN } from '@polkadot/util';
import type {
  Fungible,
  SubstrateResource,
  Transfer,
  TransferType,
  Resource,
} from '../../types/index.js';
import { Environment, FeeHandlerType, ResourceType } from '../../types/index.js';
import { Config } from '../../index.js';
import { BaseAssetTransfer } from '../BaseAssetTransfer.js';
import type { SubstrateFee } from './index.js';
import { deposit, getBasicFee, getFeeHandler, getPercentageFee } from './index.js';

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
    const substrateResource = transfer.resource as SubstrateResource;

    const feeHandlerType = await getFeeHandler(
      this.apiPromise,
      transfer.to.id,
      substrateResource.xcmMultiAssetId,
    );

    switch (feeHandlerType) {
      case FeeHandlerType.BASIC:
        return await getBasicFee(
          this.apiPromise,
          transfer.to.id,
          substrateResource.xcmMultiAssetId,
        );
      case FeeHandlerType.PERCENTAGE:
        return await getPercentageFee(this.apiPromise, transfer as Transfer<Fungible>);
      default:
        throw new Error('Unable to retrieve fee');
    }
  }

  /**
   * Builds an unsigned transfer transaction.
   *
   * @param {Transfer} transfer Instance of transfer
   * @param {Fee} fee The fee to be paid for the transfer
   * @param {Boolean} skipDestinationBalanceCheck Flag to disable destination chain balance check
   * @param {String} destinationProviderUrl URL for destination chain provider
   * @returns {Promise<SubmittableExtrinsic<'promise', SubmittableResult>>} SubmittableExtrinsic which can be signed and sent
   * @throws {Error} Transfer amount too low
   * @throws {Error} Destination Chain URL is required
   * @throws {Error} Insufficient destination chain liquidity to proceed with transfer
   */
  public buildTransferTransaction(
    transfer: Transfer<TransferType>,
    fee: SubstrateFee,
  ): SubmittableExtrinsic<'promise', SubmittableResult> {
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        const fungibleTransfer = transfer as Transfer<Fungible>;

        if (new BN(fungibleTransfer.details.amount).lt(fee.fee)) {
          throw new Error('Transfer amount should be higher than transfer fee');
        }

        return deposit(
          this.environment,
          this.apiPromise,
          (transfer.resource as SubstrateResource).xcmMultiAssetId,
          fungibleTransfer.details.amount,
          transfer.to.id.toString(),
          fungibleTransfer.details.recipient,
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

  override async isRouteRegistered(
    destinationDomainID: string,
    resource: Resource,
  ): Promise<boolean> {
    const feeHandler = await getFeeHandler(
      this.apiPromise,
      Number(destinationDomainID),
      (resource as SubstrateResource).xcmMultiAssetId,
    );
    return feeHandler != FeeHandlerType.UNDEFINED;
  }
}
