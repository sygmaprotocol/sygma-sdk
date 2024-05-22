"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNativeTokenBalance = void 0;
/**
 * Retrieves balance value in native tokens of the network
 *
 * @category Token iteractions
 * @param {ApiPromise} api - An ApiPromise instance.
 * @param {string} accountAddress - The address of the account for which to retrieve the asset balance.
 * @returns {Promise<AccountData>} A promise that resolves to a AccountData.
 */
const getNativeTokenBalance = async (api, accountAddress) => {
    const accountInfo = await api.query.system.account(accountAddress);
    return accountInfo.data;
};
exports.getNativeTokenBalance = getNativeTokenBalance;
//# sourceMappingURL=getNativeTokenBalance.js.map