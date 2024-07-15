import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import type { SubstrateResource } from '@buildwithsygma/core';
import type { Option } from '@polkadot/types';
import type { AssetBalance } from '@polkadot/types/interfaces';
import type { AccountData, AccountInfo } from '@polkadot/types/interfaces';

/**
 * Retrieves the asset balance of a given account.
 *
 * @category Token interactions
 * @param {ApiPromise} api - The API instance used to query the chain.
 * @param {number} assetID - The ID of the asset to query. {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset | More details}
 * @param {string} accountAddress - The address of the account for which to retrieve the asset balance.
 * @returns {Promise<AssetBalance>} A promise that resolves with the retrieved asset balance.
 */
export const getAssetBalance = async (
  api: ApiPromise,
  assetID: number,
  accountAddress: string,
): Promise<AssetBalance> => {
  const assetRes = await api.query.assets.account<Option<AssetBalance>>(assetID, accountAddress);
  return assetRes.unwrapOrDefault();
};

/**
 * Retrieves balance value in native tokens of the network
 *
 * @category Token interactions
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

export const getSubstrateHandlerBalance = async (
  destinationProviderUrl: string,
  resource: SubstrateResource,
  handlerAddress: string,
): Promise<bigint> => {
  const wsProvider = new WsProvider(destinationProviderUrl);
  const apiPromise = new ApiPromise({ provider: wsProvider });
  if (resource.native) {
    const accountInfo = await getNativeTokenBalance(apiPromise, handlerAddress);
    return BigInt(accountInfo.free.toString());
  } else {
    const assetBalance = await getAssetBalance(apiPromise, resource.assetID ?? 0, handlerAddress);
    return BigInt(assetBalance.balance.toString());
  }
};
