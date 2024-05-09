import type { PopulatedTransaction } from 'ethers';
import type { TransactionRequest } from '../types.js';

export function createTransactionRequest(transaction: PopulatedTransaction): TransactionRequest {
  return {
    to: transaction.to,
    value: transaction.value ? transaction.value.toBigInt() : undefined,
    data: transaction.data,
    gasLimit: transaction.gasLimit ? transaction.gasLimit.toBigInt() : undefined,
  } as TransactionRequest;
}
