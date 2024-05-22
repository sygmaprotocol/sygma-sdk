import type { ContractReceipt, PopulatedTransaction, ethers } from 'ethers';
import { BigNumber } from 'ethers';
import type { Bridge } from '@buildwithsygma/sygma-contracts';
import type { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge.js';
import type { Erc20TransferParamsType, Erc721TransferParamsType, EvmFee } from '../types/index.js';
export declare const ASSET_TRANSFER_GAS_LIMIT: BigNumber;
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
export declare const erc20Transfer: ({ amount, recipientAddress, parachainId, bridgeInstance, domainId, resourceId, feeData, overrides, }: Erc20TransferParamsType) => Promise<PopulatedTransaction>;
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
export declare const erc721Transfer: ({ id: tokenId, recipientAddress, parachainId, bridgeInstance, domainId, resourceId, feeData, overrides, }: Erc721TransferParamsType) => Promise<PopulatedTransaction>;
type GenericMessageParams = {
    executeFunctionSignature: string;
    executeContractAddress: string;
    maxFee: string;
    depositor: string;
    executionData: string;
    domainId: string;
    resourceId: string;
    bridgeInstance: Bridge;
    feeData: EvmFee;
    overrides?: ethers.PayableOverrides;
};
export declare const genericMessageTransfer: ({ executeFunctionSignature, executeContractAddress, maxFee, depositor, executionData, bridgeInstance, domainId, resourceId, feeData, overrides, }: GenericMessageParams) => Promise<PopulatedTransaction>;
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
export declare const executeDeposit: (domainId: string, resourceId: string, depositData: string, feeData: EvmFee, bridgeInstance: Bridge, overrides?: ethers.PayableOverrides) => Promise<PopulatedTransaction>;
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
export declare const getDepositEventFromReceipt: (depositTx: ContractReceipt, bridgeContract: Bridge) => Promise<DepositEvent>;
export {};
//# sourceMappingURL=depositFns.d.ts.map