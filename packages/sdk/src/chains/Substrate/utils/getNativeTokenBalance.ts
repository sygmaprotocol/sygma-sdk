import { ApiPromise } from '@polkadot/api';
import type { AccountData, AccountInfo } from '@polkadot/types/interfaces';
/**
 * Retrieves balance value in native tokens of the network
 *
 * @category Token iteractions
 * @param {ApiPromise} api - An ApiPromise instance.
 * @param {string} accountAddress - The address of the account for which to retrieve the asset balance.
 * @returns {Promise<AccountData>} A promise that resolves to a AccountData.
 */
export const getNativeTokenBalance = async (
  api: ApiPromise,
  accountAddress: string,
): Promise<AccountData> => {
  const accountInfo = await api.query.system.account<AccountInfo>(accountAddress);
  return accountInfo.data;
};
