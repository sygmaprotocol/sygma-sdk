"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepositEventFromReceipt = exports.executeDeposit = exports.genericMessageTransfer = exports.erc721Transfer = exports.erc20Transfer = exports.ASSET_TRANSFER_GAS_LIMIT = void 0;
const ethers_1 = require("ethers");
const helpers_js_1 = require("../helpers.js");
const index_js_1 = require("../../../types/index.js");
exports.ASSET_TRANSFER_GAS_LIMIT = ethers_1.BigNumber.from(300000);
/**
 * Perform an erc20 transfer
 *
 * @example
 * const params = {
 *   amount: '100',
 *   recipientAddress: '0x1234567890123456789012345678901234567890',
 *   bridgeInstance: new Bridge(), // Bridge instance from the sygma-contracts
 *   domainId: '1',
 *   resourceId: '0x000000000000000001',
 *   feeData: { ... }, // fee data
 * }
 * const transaction = await erc20Transfer(params)
 *
 * @category Bridge deposit
 * @param {Erc20TransferParamsType} params - The parameters for the erc20 transfer function.
 * @returns {Promise<ContractTransaction>} - The populated transaction.
 */
const erc20Transfer = async ({ amount, recipientAddress, parachainId, bridgeInstance, domainId, resourceId, feeData, overrides, }) => {
    // construct the deposit data
    const depositData = (0, helpers_js_1.createERCDepositData)(amount, recipientAddress, parachainId);
    // pass data to smartcontract function and create a transaction
    return (0, exports.executeDeposit)(domainId, resourceId, depositData, feeData, bridgeInstance, overrides);
};
exports.erc20Transfer = erc20Transfer;
/**
 * Perform an erc721 transfer
 *
 * @example
 * const params = {
 *   domainId: '9',
 *   resourceId: '0x00001',
 *   id: '123123123', // tokenID from the ERC721
 *   recipientAddress: '0x123ABCD',
 *   bridgeInstance: new Bridge(),  // from the sygma-contacts
 *   feeData: { .. }, // fee data
 * };
 * const tx = await erc721Transfer(params);
 *
 * @category Bridge deposit
 * @param {Erc721TransferParamsType} params - The parameters for ERC721 token transfer.
 * @returns {Promise<ContractTransaction>} A promise that resolves to the contract receipt.
 */
const erc721Transfer = async ({ id: tokenId, recipientAddress, parachainId, bridgeInstance, domainId, resourceId, feeData, overrides, }) => {
    // construct the deposit data
    const depositData = (0, helpers_js_1.createERCDepositData)(tokenId, recipientAddress, parachainId);
    // pass data to smartcontract function and create a transaction
    return (0, exports.executeDeposit)(domainId, resourceId, depositData, feeData, bridgeInstance, overrides);
};
exports.erc721Transfer = erc721Transfer;
const genericMessageTransfer = async ({ executeFunctionSignature, executeContractAddress, maxFee, depositor, executionData, bridgeInstance, domainId, resourceId, feeData, overrides, }) => {
    const depositData = (0, helpers_js_1.createPermissionlessGenericDepositData)(executeFunctionSignature, executeContractAddress, maxFee, depositor, executionData);
    return (0, exports.executeDeposit)(domainId, resourceId, depositData, feeData, bridgeInstance, overrides);
};
exports.genericMessageTransfer = genericMessageTransfer;
/**
 * Executes a deposit operation using the specified parameters and returns a populated transaction.
 *
 *
 * @category Bridge deposit
 * @param {string} domainId - The unique identifier for destination network.
 * @param {string} resourceId - The resource ID associated with the token.
 * @param {string} depositData - The deposit data required for the operation.
 * @param {FeeDataResult} feeData - The fee data result for the deposit operation.
 * @param {Bridge} bridgeInstance - The bridge instance used to perform the deposit operation.
 * @returns {Promise<PopulatedTransaction>} Unsigned transaction
 */
const executeDeposit = async (domainId, resourceId, depositData, feeData, bridgeInstance, overrides) => {
    const transactionSettings = {
        value: feeData.type == index_js_1.FeeHandlerType.PERCENTAGE ? 0 : feeData.fee,
        gasLimit: exports.ASSET_TRANSFER_GAS_LIMIT,
    };
    const payableOverrides = {
        ...transactionSettings,
        ...overrides,
    };
    const tx = await bridgeInstance.populateTransaction.deposit(domainId, resourceId, depositData, feeData.feeData ? feeData.feeData : '0x0', payableOverrides);
    return tx;
};
exports.executeDeposit = executeDeposit;
/**
 * Retrieves the deposit event from a given contract receipt.
 *
 * @example
 * // Assuming you have a valid contract receipt (contractReceipt) and a bridge contract instance (bridge)
 * const depositEvent = await getDepositEventFromReceipt(contractReceipt, bridge);
 * console.log('Deposit event:', depositEvent);
 * console.log('Deposit nonce:', depositEvent.args.depositNonce)
 *
 * @category Bridge deposit
 * @param {ContractReceipt} depositTx - The contract receipt containing the deposit transaction details.
 * @param {Bridge} bridgeContract - The bridge contract instance used to query the deposit event.
 * @returns {Promise<DepositEvent>} A promise that resolves to the deposit event associated with the given contract receipt.
 */
const getDepositEventFromReceipt = async (depositTx, bridgeContract) => {
    try {
        const depositFilter = bridgeContract.filters.Deposit();
        const events = await bridgeContract.queryFilter(depositFilter, depositTx.blockHash);
        const event = events[0];
        return event;
    }
    catch (error) {
        console.error('Error on getDepositEventFromReceipt', error);
        return Promise.reject(error);
    }
};
exports.getDepositEventFromReceipt = getDepositEventFromReceipt;
//# sourceMappingURL=depositFns.js.map