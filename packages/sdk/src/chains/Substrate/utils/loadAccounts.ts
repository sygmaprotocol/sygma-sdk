import { ApiPromise } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { keyring as Keyring } from '@polkadot/ui-keyring';
import { isTestChain } from '@polkadot/util';

import { SubstrateConfigType } from '../types';

import { retrieveChainInfo } from '../utils';

export type LoadAccountsCallbacksType = {
  /**
   * Callback to be called when the keyring is being loaded.
   */
  onLoadKeyring: () => void;
  /**
   * Callback to be called when the keyring is set.
   */
  onSetKeyring: (keyring: typeof Keyring) => void;
  /**
   * Callback to be called when an error occurs while loading the keyring.
   */
  onErrorKeyring: (e: unknown) => void;
};

/**
 * Loads all accounts from web3 and sets them in the Keyring.
 *
 * @param {SubstrateConfigType} config - Substrate sygma bridge config.
 * @param {ApiPromise} api - An ApiPromise instance.
 * @param {LoadAccountsCallbacksType} [callbacks] - Callback functions to be executed during the loading process.
 * @returns {Promise<void>} Promise that resolves when accounts are loaded.
 */
export const loadAccounts = async (
  config: SubstrateConfigType,
  api: ApiPromise,
  callbacks?: LoadAccountsCallbacksType,
): Promise<void> => {
  callbacks?.onLoadKeyring?.();
  try {
    // For some reason web3Enable promise is not rejecting, only console.error
    const auth = await web3Enable(config.appName);
    if (!auth || (auth as []).length === 0) {
      throw new Error('unauthorized');
    }

    let allAccounts = await web3Accounts();
    allAccounts = allAccounts.map(({ address, meta }) => ({
      address,
      meta: { ...meta, name: `${meta.name ?? 'no name'} (${meta.source})` },
    }));

    /**
     * Logics to check if the connecting chain is a dev chain, coming from polkadot-js Apps
     * @link https://github.com/polkadot-js/apps/blob/15b8004b2791eced0dde425d5dc7231a5f86c682/packages/react-api/src/Api.tsx?_pjax=div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20%3E%20main#L101-L110
     */
    const { systemChain, systemChainType } = await retrieveChainInfo(api);
    const isDevelopment =
      systemChainType.isDevelopment || systemChainType.isLocal || isTestChain(systemChain);
    Keyring.loadAll({ isDevelopment }, allAccounts);
    callbacks?.onSetKeyring?.(Keyring);
  } catch (e) {
    console.error(e);
    callbacks?.onErrorKeyring?.(e);
  }
};
