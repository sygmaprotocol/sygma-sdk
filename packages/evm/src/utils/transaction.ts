import type { PopulatedTransaction } from 'ethers';

import type { TransactionRequest } from '../types.js';
/**
 * Create a library agnostic transaction type
 * that can be sent to an EVM node
 * @param {PopulatedTransaction} transaction Ethers `PopulatedTransaction` object
 * @returns {TransactionRequest}
 */
export function createTransactionRequest(transaction: PopulatedTransaction): TransactionRequest {
  return {
    to: transaction.to,
    value: transaction.value ? transaction.value.toBigInt() : undefined,
    data: transaction.data,
    gasLimit: transaction.gasLimit ? transaction.gasLimit.toBigInt() : undefined,
  } as TransactionRequest;
}
