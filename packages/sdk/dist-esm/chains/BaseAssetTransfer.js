import { constants } from 'ethers';
import { Network, ResourceType } from '../types/index.js';
import { LiquidityError } from '../errors/customErrors.js';
import { getEvmHandlerBalance } from './EVM/utils/getEvmBalances.js';
import { getSubstrateHandlerBalance } from './Substrate/utils/getSubstrateHandlerBalance.js';
export class BaseAssetTransfer {
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
    async createFungibleTransfer(sourceAddress, destinationChainId, destinationAddress, resourceId, amount, parachainId, destinationProviderUrl) {
        const { sourceDomain, destinationDomain, resource } = this.config.getBaseTransferParams(destinationChainId, resourceId);
        const transfer = {
            sender: sourceAddress,
            details: {
                amount,
                recipient: destinationAddress,
                parachainId: parachainId,
            },
            from: sourceDomain,
            to: destinationDomain,
            resource: resource,
        };
        if (destinationProviderUrl) {
            const destinationHandlerBalance = await this.fetchDestinationHandlerBalance(destinationProviderUrl, transfer);
            if (destinationHandlerBalance < BigInt(amount)) {
                throw new LiquidityError(destinationHandlerBalance);
            }
        }
        return transfer;
    }
    /**
     * Check if provided transfer is valid.
     *
     * This means it checks if route for this transfer exists on chain
     *
     * @param transfer instance of transfer
     */
    async isTransferValid(transfer) {
        try {
            return await this.isRouteRegistered(transfer.to.id.toString(), transfer.resource);
        }
        catch (e) {
            return false;
        }
    }
    /**
     * @param {Transfer} transfer Transfer to check
     * @param {string} destinationProviderUrl URL of the destination chain provider
     * @returns {Promise<bigint>} Handler balance on the destination chain
     * @throws {Error} No Fungible handler configured on destination domain
     */
    async fetchDestinationHandlerBalance(destinationProviderUrl, transfer) {
        const destinationDomain = this.config.getDomainConfig(transfer.to.id);
        const handlerAddress = destinationDomain.handlers.find(h => h.type === ResourceType.FUNGIBLE)?.address;
        if (!handlerAddress) {
            throw new Error('No Funglible handler configured on destination domain');
        }
        const destinationResource = destinationDomain.resources.find(r => r.resourceId === transfer.resource.resourceId);
        if (destinationResource?.burnable) {
            return BigInt(constants.MaxUint256.toString());
        }
        switch (destinationDomain.type) {
            case Network.EVM: {
                return getEvmHandlerBalance(destinationProviderUrl, destinationResource, handlerAddress);
            }
            case Network.SUBSTRATE: {
                return getSubstrateHandlerBalance(destinationProviderUrl, destinationResource, handlerAddress);
            }
        }
    }
}
//# sourceMappingURL=BaseAssetTransfer.js.map