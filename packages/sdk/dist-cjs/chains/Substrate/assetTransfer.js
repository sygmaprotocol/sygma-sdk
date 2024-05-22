"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstrateAssetTransfer = void 0;
const util_1 = require("@polkadot/util");
const index_js_1 = require("../../types/index.js");
const index_js_2 = require("../../index.js");
const BaseAssetTransfer_js_1 = require("../BaseAssetTransfer.js");
const index_js_3 = require("./index.js");
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
class SubstrateAssetTransfer extends BaseAssetTransfer_js_1.BaseAssetTransfer {
    async init(apiPromise, environment = index_js_1.Environment.MAINNET) {
        this.apiPromise = apiPromise;
        const parachainId = apiPromise.consts.sygmaBridge.eip712ChainID;
        this.environment = environment;
        this.config = new index_js_2.Config();
        // This is probably not too safe and might overflow
        await this.config.init(parachainId.toNumber(), environment);
    }
    /**
     * Calculates fee required for the requested transfer.
     *
     * @param transfer instance of transfer
     * @returns fee that needs to paid
     */
    async getFee(transfer) {
        const substrateResource = transfer.resource;
        const feeHandlerType = await (0, index_js_3.getFeeHandler)(this.apiPromise, transfer.to.id, substrateResource.xcmMultiAssetId);
        switch (feeHandlerType) {
            case index_js_1.FeeHandlerType.BASIC:
                return await (0, index_js_3.getBasicFee)(this.apiPromise, transfer.to.id, substrateResource.xcmMultiAssetId);
            case index_js_1.FeeHandlerType.PERCENTAGE:
                return await (0, index_js_3.getPercentageFee)(this.apiPromise, transfer);
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
    buildTransferTransaction(transfer, fee) {
        switch (transfer.resource.type) {
            case index_js_1.ResourceType.FUNGIBLE: {
                const fungibleTransfer = transfer;
                if (new util_1.BN(fungibleTransfer.details.amount).lt(fee.fee)) {
                    throw new Error('Transfer amount should be higher than transfer fee');
                }
                return (0, index_js_3.deposit)(this.environment, this.apiPromise, transfer.resource.xcmMultiAssetId, fungibleTransfer.details.amount, transfer.to.id.toString(), fungibleTransfer.details.recipient);
            }
            default:
                throw new Error(`Resource type ${transfer.resource.type} with ${fee.fee.toString()} not supported by asset transfer`);
        }
    }
    async isRouteRegistered(destinationDomainID, resource) {
        const feeHandler = await (0, index_js_3.getFeeHandler)(this.apiPromise, Number(destinationDomainID), resource.xcmMultiAssetId);
        return feeHandler != index_js_1.FeeHandlerType.UNDEFINED;
    }
}
exports.SubstrateAssetTransfer = SubstrateAssetTransfer;
//# sourceMappingURL=assetTransfer.js.map