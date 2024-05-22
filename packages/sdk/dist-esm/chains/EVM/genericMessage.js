import { Bridge__factory, FeeHandlerRouter__factory } from '@buildwithsygma/sygma-contracts';
import { Environment, FeeHandlerType, ResourceType } from '../../types/index.js';
import { Config } from '../../config/config.js';
import { calculateBasicfee } from './fee/index.js';
import { genericMessageTransfer } from './utils/index.js';
export class EVMGenericMessageTransfer {
    async init(provider, environment = Environment.MAINNET) {
        this.provider = provider;
        const network = await this.provider.getNetwork();
        this.environment = environment;
        this.config = new Config();
        await this.config.init(network.chainId, this.environment);
    }
    /**
     * Calculates fee required for the requested transfer.
     * Fee can be paid in native currency or ERC20 token if the 'tokenAddress'
     * is defined.
     *
     * @param transfer instance of transfer
     * @returns fee that needs to paid
     */
    async getFee(transfer) {
        const domainConfig = this.config.getSourceDomainConfig();
        const feeRouter = FeeHandlerRouter__factory.connect(domainConfig.feeRouter, this.provider);
        const feeHandlerAddress = await feeRouter._domainResourceIDToFeeHandlerAddress(transfer.to.id, transfer.resource.resourceId);
        const feeHandlerConfig = domainConfig.feeHandlers.find(feeHandler => feeHandler.address == feeHandlerAddress);
        switch (feeHandlerConfig.type) {
            case FeeHandlerType.BASIC: {
                return await calculateBasicfee({
                    basicFeeHandlerAddress: feeHandlerAddress,
                    provider: this.provider,
                    fromDomainID: transfer.from.id,
                    toDomainID: transfer.to.id,
                    resourceID: transfer.resource.resourceId,
                    sender: transfer.sender,
                });
            }
            default:
                throw new Error(`Unsupported fee handler type`);
        }
    }
    /**
     * Builds an unsigned transfer transaction.
     * Should be executed after the approval transactions.
     *
     * @param transfer
     * @param fee
     * @returns unsigned transfer transaction
     */
    async buildTransferTransaction(transfer, fee) {
        const bridge = Bridge__factory.connect(this.config.getSourceDomainConfig().bridge, this.provider);
        switch (transfer.resource.type) {
            case ResourceType.PERMISSIONLESS_GENERIC: {
                const genericTransfer = transfer;
                return await genericMessageTransfer({
                    depositor: transfer.sender,
                    bridgeInstance: bridge,
                    domainId: transfer.to.id.toString(),
                    resourceId: transfer.resource.resourceId,
                    feeData: fee,
                    executeContractAddress: genericTransfer.details.destinationContractAddress,
                    executeFunctionSignature: genericTransfer.details.destinationFunctionSignature,
                    executionData: genericTransfer.details.executionData,
                    maxFee: genericTransfer.details.maxFee,
                });
            }
            default:
                throw new Error(`Resource type not supported by generic message transfer`);
        }
    }
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
    createGenericMessageTransfer(sourceAddress, destinationChainId, resourceId, destinationContractAddress, destinationFunctionSignature, executionData, maxFee, tokenAmount) {
        const { sourceDomain, destinationDomain, resource } = this.config.getBaseTransferParams(destinationChainId, resourceId);
        const transfer = {
            sender: sourceAddress,
            details: {
                destinationContractAddress: destinationContractAddress,
                destinationFunctionSignature: destinationFunctionSignature,
                executionData: executionData,
                maxFee: maxFee,
                tokenAmount: tokenAmount || '0',
            },
            from: sourceDomain,
            to: destinationDomain,
            resource: resource,
        };
        return transfer;
    }
}
//# sourceMappingURL=genericMessage.js.map