import type { PopulatedTransaction, providers } from 'ethers';
import type { GenericMessage, Transfer, TransferType } from '../../types/index.js';
import { Environment } from '../../types/index.js';
import type { EvmFee } from './types/index.js';
export declare class EVMGenericMessageTransfer {
    private provider;
    private config;
    private environment;
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
     * Builds an unsigned transfer transaction.
     * Should be executed after the approval transactions.
     *
     * @param transfer
     * @param fee
     * @returns unsigned transfer transaction
     */
    buildTransferTransaction(transfer: Transfer<TransferType>, fee: EvmFee): Promise<PopulatedTransaction>;
    /**
     * Creates a Transfer<Fungible> object which can then be used to estimate transfer
     * fees as well as create the necessary desposit and approval transactions.
     *
     * @category Bridge deposit
     * @param {string} sourceAddress - The address of the sender
     * @param {number} destinationChainId - The (Para)ChainId of the destination chain
     * @param {string} destinationAddress - The address of the recipient on the destination chain
     * @param {string} resourceId - The ID of the resource being transferred
     * @param {string} amount - The amount of tokens to be transferred. The amount should be in the lowest denomination possible on the source chain. If the token on source chain is configured to use 12 decimals and the amount to be transferred is 1 ETH, then amount should be passed in as 1000000000000
     * @returns {Transfer<Fungible>} - The populated transfer object
     * @throws {Error} - Source domain not supported, Destination domain not supported, Resource not supported
     */
    createGenericMessageTransfer(sourceAddress: string, destinationChainId: number, resourceId: string, destinationContractAddress: string, destinationFunctionSignature: string, executionData: string, maxFee: string, tokenAmount?: string): Transfer<GenericMessage>;
}
//# sourceMappingURL=genericMessage.d.ts.map