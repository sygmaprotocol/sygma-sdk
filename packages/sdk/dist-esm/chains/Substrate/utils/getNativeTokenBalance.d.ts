import type { ApiPromise } from '@polkadot/api';
import type { AccountData } from '@polkadot/types/interfaces';
/**
 * Retrieves balance value in native tokens of the network
 *
 * @category Token iteractions
 * @param {ApiPromise} api - An ApiPromise instance.
 * @param {string} accountAddress - The address of the account for which to retrieve the asset balance.
 * @returns {Promise<AccountData>} A promise that resolves to a AccountData.
 */
export declare const getNativeTokenBalance: (api: ApiPromise, accountAddress: string) => Promise<AccountData>;
//# sourceMappingURL=getNativeTokenBalance.d.ts.map