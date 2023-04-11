import { ApiPromise } from '@polkadot/api';
import type { AccountData, AccountInfoWithTripleRefCount } from '@polkadot/types/interfaces';

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

/**
 * Retrieves balance value in native tokens of the network
 *
 * @category Token iteractions
 * @param {ApiPromise} api - An ApiPromise instance.
 * @param {InjectedAccountWithMeta} currentAccount - The current account.
 * @returns {Promise<AccountData>} A promise that resolves to a AccountData.
 */
export const getNativeTokenBalance = async (
  api: ApiPromise,
  currentAccount: InjectedAccountWithMeta,
): Promise<AccountData> => {
  const accountInfo: unknown = await api.query.system.account(currentAccount.address);
  const balanceData = accountInfo as AccountInfoWithTripleRefCount;
  return balanceData.data;
};
