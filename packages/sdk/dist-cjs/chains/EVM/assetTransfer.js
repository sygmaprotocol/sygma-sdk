"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMAssetTransfer = void 0;
const ethers_1 = require("ethers");
const sygma_contracts_1 = require("@buildwithsygma/sygma-contracts");
const index_js_1 = require("../../types/index.js");
const index_js_2 = require("../../index.js");
const BaseAssetTransfer_js_1 = require("../BaseAssetTransfer.js");
const index_js_3 = require("./index.js");
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
class EVMAssetTransfer extends BaseAssetTransfer_js_1.BaseAssetTransfer {
    async init(provider, environment = index_js_1.Environment.MAINNET) {
        this.provider = provider;
        const network = await this.provider.getNetwork();
        this.environment = environment;
        this.config = new index_js_2.Config();
        await this.config.init(network.chainId, environment);
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
        const { feeHandlerAddress, feeHandlerType } = await this.getFeeInformation(transfer);
        switch (feeHandlerType) {
            case index_js_1.FeeHandlerType.BASIC: {
                return await (0, index_js_3.calculateBasicfee)({
                    basicFeeHandlerAddress: feeHandlerAddress,
                    provider: this.provider,
                    fromDomainID: transfer.from.id,
                    toDomainID: transfer.to.id,
                    resourceID: transfer.resource.resourceId,
                    sender: transfer.sender,
                });
            }
            case index_js_1.FeeHandlerType.PERCENTAGE: {
                const fungibleTransfer = transfer;
                return await (0, index_js_3.getPercentageFee)({
                    precentageFeeHandlerAddress: feeHandlerAddress,
                    provider: this.provider,
                    sender: transfer.sender,
                    fromDomainID: Number(transfer.from.id),
                    toDomainID: Number(transfer.to.id),
                    resourceID: transfer.resource.resourceId,
                    depositData: (0, index_js_3.createERCDepositData)(fungibleTransfer.details.amount, fungibleTransfer.details.recipient, fungibleTransfer.details.parachainId),
                });
            }
            default:
                throw new Error(`Not able to get fee: unsupported fee handler type`);
        }
    }
    /**
     * Builds approval transactions that are required before executing
     * deposit. Returns multiple approvals if fee is payed in ERC20 token.
     *
     * @param {Transfer} transfer Transfer
     * @param {Fee} fee Fee calculated by 'getFee' function
     * @returns array of unsigned approval transaction
     */
    async buildApprovals(transfer, fee) {
        const bridge = sygma_contracts_1.Bridge__factory.connect(this.config.getSourceDomainConfig().bridge, this.provider);
        const handlerAddress = await bridge._resourceIDToHandlerAddress(transfer.resource.resourceId);
        const approvals = [];
        switch (transfer.resource.type) {
            case index_js_1.ResourceType.FUNGIBLE: {
                const erc20 = sygma_contracts_1.ERC20__factory.connect(transfer.resource.address, this.provider);
                approvals.push(...(await this.getERC20Approvals(erc20, fee, transfer, handlerAddress)));
                break;
            }
            case index_js_1.ResourceType.NON_FUNGIBLE: {
                const erc721 = sygma_contracts_1.ERC721MinterBurnerPauser__factory.connect(transfer.resource.address, this.provider);
                approvals.push(...(await this.getERC721Approvals(erc721, transfer, handlerAddress)));
                break;
            }
            default:
                throw new Error(`Resource type not supported by asset transfer`);
        }
        return approvals;
    }
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
    async buildTransferTransaction(transfer, fee) {
        const bridge = sygma_contracts_1.Bridge__factory.connect(this.config.getSourceDomainConfig().bridge, this.provider);
        switch (transfer.resource.type) {
            case index_js_1.ResourceType.FUNGIBLE: {
                const fungibleTransfer = transfer;
                return await (0, index_js_3.erc20Transfer)({
                    amount: fungibleTransfer.details.amount,
                    recipientAddress: fungibleTransfer.details.recipient,
                    parachainId: fungibleTransfer.details.parachainId,
                    bridgeInstance: bridge,
                    domainId: transfer.to.id.toString(),
                    resourceId: transfer.resource.resourceId,
                    feeData: fee,
                });
            }
            case index_js_1.ResourceType.NON_FUNGIBLE: {
                const nonfungibleTransfer = transfer;
                return await (0, index_js_3.erc721Transfer)({
                    id: nonfungibleTransfer.details.tokenId,
                    recipientAddress: nonfungibleTransfer.details.recipient,
                    parachainId: nonfungibleTransfer.details.parachainId,
                    bridgeInstance: bridge,
                    domainId: transfer.to.id.toString(),
                    resourceId: transfer.resource.resourceId,
                    feeData: fee,
                });
            }
            default:
                throw new Error(`Resource type not supported by asset transfer`);
        }
    }
    async isRouteRegistered(destinationDomainID, resource) {
        const config = this.config.getSourceDomainConfig();
        const registeredHandler = await (0, index_js_2.getFeeHandlerAddress)(this.provider, config.feeRouter, destinationDomainID, resource.resourceId);
        return ethers_1.utils.isAddress(registeredHandler) && registeredHandler != ethers_1.constants.AddressZero;
    }
    async getFeeInformation(transfer) {
        const domainConfig = this.config.getSourceDomainConfig();
        const feeRouter = sygma_contracts_1.FeeHandlerRouter__factory.connect(domainConfig.feeRouter, this.provider);
        const feeHandlerAddress = await feeRouter._domainResourceIDToFeeHandlerAddress(transfer.to.id, transfer.resource.resourceId);
        if (!ethers_1.utils.isAddress(feeHandlerAddress) || feeHandlerAddress === ethers_1.constants.AddressZero) {
            throw new Error(`Failed getting fee: route not registered on fee handler`);
        }
        const feeHandlerConfig = domainConfig.feeHandlers.find(feeHandler => feeHandler.address == feeHandlerAddress);
        if (!feeHandlerConfig) {
            throw new Error(`Failed getting fee: fee handler not registered on environment`);
        }
        return { feeHandlerAddress: feeHandlerAddress, feeHandlerType: feeHandlerConfig.type };
    }
    async getERC20Approvals(erc20, fee, transfer, handlerAddress) {
        const approvals = [];
        if (fee.type == index_js_1.FeeHandlerType.PERCENTAGE &&
            (await (0, index_js_3.getERC20Allowance)(transfer.sender, erc20, fee.handlerAddress)).lt(fee.fee)) {
            approvals.push(await (0, index_js_3.approve)(fee.fee.toString(), erc20, fee.handlerAddress));
        }
        const transferAmount = ethers_1.BigNumber.from(transfer.details.amount);
        if ((await (0, index_js_3.getERC20Allowance)(transfer.sender, erc20, handlerAddress)).lt(transferAmount)) {
            approvals.push(await (0, index_js_3.approve)(transferAmount.toString(), erc20, handlerAddress));
        }
        return approvals;
    }
    async getERC721Approvals(erc721, transfer, handlerAddress) {
        const approvals = [];
        if (!(await (0, index_js_3.isApproved)(Number(transfer.details.tokenId), erc721, handlerAddress))) {
            approvals.push(await (0, index_js_3.approve)(transfer.details.tokenId, erc721, handlerAddress));
        }
        return approvals;
    }
}
exports.EVMAssetTransfer = EVMAssetTransfer;
//# sourceMappingURL=assetTransfer.js.map