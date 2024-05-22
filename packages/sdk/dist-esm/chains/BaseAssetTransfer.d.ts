import type { Config } from '../config/config.js';
import type { Environment, Fungible, Resource, Transfer, TransferType } from '../types/index.js';
import type { ParachainID } from './Substrate/index.js';
export declare abstract class BaseAssetTransfer {
    config: Config;
    environment: Environment;
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
     * @param {string} [parachainId] - Optional parachain id if the substrate destination parachain differs from the target domain.
     * @param {string} [destinationProviderUrl] Destination Chain RPC URL - If passed in, this will perform a liquidity check on the destination chain handler.
     * @returns {Transfer<Fungible>} - The populated transfer object
     * @throws {Error} - Source domain not supported, Destination domain not supported, Resource not supported, destination liquiditry too low
     */
    createFungibleTransfer(sourceAddress: string, destinationChainId: number, destinationAddress: string, resourceId: string, amount: string, parachainId?: ParachainID, destinationProviderUrl?: string): Promise<Transfer<Fungible>>;
    /**
     * Returns if route is registered for resource between source domain of asset transfer and provided destination domain (on-chain check).
     *
     * @param {string} destinationDomainID - Destination domain ID
     * @param resource - Resource for which we want to check if route is opened
     */
    abstract isRouteRegistered(destinationDomainID: string, resource: Resource): Promise<boolean>;
    /**
     * Check if provided transfer is valid.
     *
     * This means it checks if route for this transfer exists on chain
     *
     * @param transfer instance of transfer
     */
    isTransferValid(transfer: Transfer<TransferType>): Promise<boolean>;
    /**
     * @param {Transfer} transfer Transfer to check
     * @param {string} destinationProviderUrl URL of the destination chain provider
     * @returns {Promise<bigint>} Handler balance on the destination chain
     * @throws {Error} No Fungible handler configured on destination domain
     */
    fetchDestinationHandlerBalance(destinationProviderUrl: string, transfer: Transfer<TransferType>): Promise<bigint>;
}
//# sourceMappingURL=BaseAssetTransfer.d.ts.map