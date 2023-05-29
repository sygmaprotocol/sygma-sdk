import { ApiPromise } from '@polkadot/api';
import type { AssetBalance } from '@polkadot/types/interfaces';
import { Option } from '@polkadot/types';

/**
 * Retrieves the asset balance of a given account.
 *
 * @category Token iteractions
 * @param {ApiPromise} api - The API instance used to query the chain.
 * @param {number} assetId - The ID of the asset to query. {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset | More details}
 * @param {string} accountAddress - The address of the account for which to retrieve the asset balance.
 * @returns {Promise<AssetBalance>} A promise that resolves with the retrieved asset balance.
 */
export const getAssetBalance = async (
  api: ApiPromise,
  assetId: number,
  accountAddress: string,
): Promise<AssetBalance> => {
  const assetRes = await api.query.assets.account<Option<AssetBalance>>(assetId, accountAddress);
  return assetRes.unwrapOrDefault();
};
