"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetBalance = void 0;
/**
 * Retrieves the asset balance of a given account.
 *
 * @category Token iteractions
 * @param {ApiPromise} api - The API instance used to query the chain.
 * @param {number} assetID - The ID of the asset to query. {@link https://github.com/sygmaprotocol/sygma-substrate-pallets#multiasset | More details}
 * @param {string} accountAddress - The address of the account for which to retrieve the asset balance.
 * @returns {Promise<AssetBalance>} A promise that resolves with the retrieved asset balance.
 */
const getAssetBalance = async (api, assetID, accountAddress) => {
    const assetRes = await api.query.assets.account(assetID, accountAddress);
    return assetRes.unwrapOrDefault();
};
exports.getAssetBalance = getAssetBalance;
//# sourceMappingURL=getAssetBalance.js.map