import { FeeHandlerType } from '@buildwithsygma/core';
import type { Bridge } from '@buildwithsygma/sygma-contracts';
import type { PopulatedTransaction, ethers } from 'ethers';
import { BigNumber } from 'ethers';

import type { EvmFee, FungibleTransferParams } from '../types.js';

import { createERCDepositData, createPermissionlessGenericDepositData } from './helpers.js';

export const ASSET_TRANSFER_GAS_LIMIT: BigNumber = BigNumber.from(300000);

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
export const erc20Transfer = async ({
  amount,
  recipientAddress,
  parachainId,
  bridgeInstance,
  domainId,
  resourceId,
  feeData,
  overrides,
}: FungibleTransferParams): Promise<PopulatedTransaction> => {
  // construct the deposit data
  const depositData = createERCDepositData(amount, recipientAddress, parachainId);

  // pass data to smartcontract function and create a transaction
  return executeDeposit(domainId, resourceId, depositData, feeData, bridgeInstance, overrides);
};

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
export const executeDeposit = async (
  domainId: string,
  resourceId: string,
  depositData: string,
  feeData: EvmFee,
  bridgeInstance: Bridge,
  overrides?: ethers.PayableOverrides,
): Promise<PopulatedTransaction> => {
  const transactionSettings = {
    value: feeData.type == FeeHandlerType.PERCENTAGE ? 0 : feeData.fee,
    gasLimit: ASSET_TRANSFER_GAS_LIMIT,
  };

  const payableOverrides = {
    ...transactionSettings,
    ...overrides,
  };

  const depositTransaction = await bridgeInstance.populateTransaction.deposit(
    domainId,
    resourceId,
    depositData,
    feeData.fee ? BigNumber.from(feeData.fee).toHexString() : '0x00',
    payableOverrides,
  );
  return depositTransaction;
};

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

export const genericMessageTransfer = async ({
  executeFunctionSignature,
  executeContractAddress,
  maxFee,
  depositor,
  executionData,
  bridgeInstance,
  domainId,
  resourceId,
  feeData,
  overrides,
}: GenericMessageParams): Promise<PopulatedTransaction> => {
  const depositData = createPermissionlessGenericDepositData(
    executeFunctionSignature,
    executeContractAddress,
    maxFee,
    depositor,
    executionData,
  );
  return executeDeposit(domainId, resourceId, depositData, feeData, bridgeInstance, overrides);
};