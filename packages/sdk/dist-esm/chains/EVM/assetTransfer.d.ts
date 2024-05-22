import type { PopulatedTransaction, UnsignedTransaction, providers } from 'ethers';
import type { Resource, Transfer, TransferType } from '../../types/index.js';
import { Environment } from '../../types/index.js';
import { BaseAssetTransfer } from '../BaseAssetTransfer.js';
import type { EvmFee } from './index.js';
/**
 * Class used for sending ERC20 and ERC721 transfers from EVM based chains.
 *
 *
 * @example
 * const provider = new ethers.providers.JsonRpcProvider('<rpc>');
 * const wallet = new Wallet(
 *  '<pk>',
 *  provider,
 * );
 * const assetTransfer = new EVMAssetTransfer();
 * await assetTransfer.init(provider);
 * const domains = assetTransfer.config.getDomains();
 * const resources = assetTransfer.config.getDomainResources();
 * const transfer: Transfer<Fungible> = {
 *  from: domains[0],
 *  to: domains[1],
 *  resource: resource[0],
 *  sender: await wallet.getAddress(),
 *  recipient: <recipient address>,
 *  amount: {
 *    amount: 200
 *  }
 * }
 * const fee = await assetTransfer.getFee(transfer);
 * const approvals = await assetTransfer.buildApprovals(transfer, fee);
 * const transferTx = await assetTransfer.buildTransferTransaction(transfer, fee);
 * for (const approval of approvals) {
 *  await wallet.sendTransaction(approval);
 * }
 * await wallet.sendTransaction(trasnferTx);
 *
 */
export declare class EVMAssetTransfer extends BaseAssetTransfer {
    private provider;
    init(provider: providers.BaseProvider, environment?: Environment): Promise<void>;
    /**
     * Calculates fee required for the requested transfer.
     * Fee can be paid in native currency or ERC20 token if the 'tokenAddress'
     * is defined.
     *
     * @param transfer instance of transfer
     * @returns fee that needs to paid
     */
    getFee(transfer: Transfer<TransferType>): Promise<EvmFee>;
    /**
     * Builds approval transactions that are required before executing
     * deposit. Returns multiple approvals if fee is payed in ERC20 token.
     *
     * @param {Transfer} transfer Transfer
     * @param {Fee} fee Fee calculated by 'getFee' function
     * @returns array of unsigned approval transaction
     */
    buildApprovals(transfer: Transfer<TransferType>, fee: EvmFee): Promise<Array<UnsignedTransaction>>;
    /**
     * Builds an unsigned transfer transaction.
     * Should be executed after the approval transactions.
     *
     * @param {Transfer} transfer requested transfer
     * @param {Fee} fee Fee calculated by 'getFee' function
     * @param {Boolean} ignoreInsufficientDestinationLiquidity Flag to disable destination chain balance check
     * @returns unsigned transfer transaction
     * @throws {Error} Insufficient destination chain liquidity to proceed with transfer
     */
    buildTransferTransaction(transfer: Transfer<TransferType>, fee: EvmFee): Promise<PopulatedTransaction>;
    isRouteRegistered(destinationDomainID: string, resource: Resource): Promise<boolean>;
    private getFeeInformation;
    private getERC20Approvals;
    private getERC721Approvals;
}
//# sourceMappingURL=assetTransfer.d.ts.map