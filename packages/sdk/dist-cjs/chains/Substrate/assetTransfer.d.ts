import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Transfer, TransferType, Resource } from '../../types/index.js';
import { Environment } from '../../types/index.js';
import { BaseAssetTransfer } from '../BaseAssetTransfer.js';
import type { SubstrateFee } from './index.js';
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
export declare class SubstrateAssetTransfer extends BaseAssetTransfer {
    private apiPromise;
    init(apiPromise: ApiPromise, environment?: Environment): Promise<void>;
    /**
     * Calculates fee required for the requested transfer.
     *
     * @param transfer instance of transfer
     * @returns fee that needs to paid
     */
    getFee(transfer: Transfer<TransferType>): Promise<SubstrateFee>;
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
    buildTransferTransaction(transfer: Transfer<TransferType>, fee: SubstrateFee): SubmittableExtrinsic<'promise', SubmittableResult>;
    isRouteRegistered(destinationDomainID: string, resource: Resource): Promise<boolean>;
}
//# sourceMappingURL=assetTransfer.d.ts.map