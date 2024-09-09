import { FeeHandlerType } from '@buildwithsygma/core';
import type { Bridge } from '@buildwithsygma/sygma-contracts';
import type { PopulatedTransaction, ethers } from 'ethers';
import { BigNumber } from 'ethers';

import type { EvmFee } from '../types.js';

export const ASSET_TRANSFER_GAS_LIMIT: BigNumber = BigNumber.from(300000);

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
    /**
     * @remarks
     * "twap" and "basic" both deduct in native currency
     */
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
    '0x',
    payableOverrides,
  );

  return depositTransaction;
};
