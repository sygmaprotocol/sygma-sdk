import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { web3FromAddress } from '@polkadot/extension-dapp';
import type { DispatchError, ExtrinsicStatus } from '@polkadot/types/interfaces';

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { XcmMultiAssetIdType } from '../types';

export type DepositEventDataType = {
  depositData: string;
  depositNonce: string;
  destDomainId: string;
  handlerResponse: string;
  resourceId: string;
  sender: string;
  transferType: string;
};

export type DepositCallbacksType = {
  /**
   * Callback for when the transaction is included in a block.
   */
  onInBlock?: (status: ExtrinsicStatus) => void;
  /**
   * Callback for when the transaction is finalized.
   */
  onFinalized?: (status: ExtrinsicStatus) => void;
  /**
   * Callback for when an error occurs.
   */
  onError?: (error: unknown) => void;
  /**
   * Callback for sygmaBridge.Deposit event on finalize stage
   */
  onDepositEvent?: (data: DepositEventDataType) => void;
};

/**
 * Calculates a big number from an amount and chain decimals retrived from API.
 *
 * @param {ApiPromise} api - An API Promise object.
 * @param {string} amount - The amount to be converted.
 * @returns {BN} The converted amount as a BN object.
 */
export const calculateBigNumber = (api: ApiPromise, amount: string): BN => {
  const bnAmount = new BN(Number(amount));
  const bnBase = new BN(10);
  const bnDecimals = new BN(api.registry.chainDecimals[0]);
  const convertAmount = bnAmount.mul(bnBase.pow(bnDecimals));
  return convertAmount;
};

/**
 * Throw errors from a SubmittableResult.
 *
 * @param {ApiPromise} api - The ApiPromise instance used to find meta errors.
 * @param {SubmittableResult} result - The SubmittableResult to log errors from.
 * @param {() => void} unsub - A function to stop listen for events.
 */
export const throwErrorIfAny = (
  api: ApiPromise,
  result: SubmittableResult,
  unsub: () => void,
): void => {
  const { events = [], status } = result;
  if (status.isInBlock || status.isFinalized) {
    events
      // find/filter for failed events
      .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
      // we know that data for system.ExtrinsicFailed is
      // (DispatchError, DispatchInfo)
      .forEach(({ event: { data } }) => {
        const error = data[0] as DispatchError;
        unsub(); // unsubscribe from subscription
        if (error.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = api.registry.findMetaError(error.asModule);
          const { docs, method, section } = decoded;

          throw new Error(`${section}.${method}: ${docs.join(' ')}`);
        } else {
          // Other, CannotLookup, BadOrigin, no extra info
          throw new Error(error.toString());
        }
      });
  }
};

/**
 * Handles the transaction extrinsic result.
 *
 * @param {ApiPromise} api - The API promise object.
 * @param {SubmittableResult} result - The submittable result object.
 * @param {Function} unsub - A function to stop listen for events.
 * @param {DepositCallbacksType=} callbacks - Optional callbacks for success and error cases.
 */
export const handleTxExtrinsicResult = (
  api: ApiPromise,
  result: SubmittableResult,
  unsub: () => void,
  callbacks?: DepositCallbacksType,
): void => {
  const { status } = result;
  console.log(`Current status is ${status.toString()}`);

  // if error has been found in events log the error and unsubsribe
  throwErrorIfAny(api, result, unsub);

  if (status.isInBlock) {
    console.log(`Transaction included at blockHash ${status.asInBlock.toString()}`);
    callbacks?.onInBlock?.(status);
  } else if (status.isFinalized) {
    console.log(`Transaction finalized at blockHash ${status.asFinalized.toString()}`);

    result.events.forEach(({ event: { data, method, section } }) => {
      // Search for Deposit event
      if (section === 'sygmaBridge' && method === 'Deposit') {
        console.log(`${section}.${method}.event data:`, data.toHuman());
        callbacks?.onDepositEvent?.(data.toHuman() as DepositEventDataType);
      }
    });

    callbacks?.onFinalized?.(status);
    unsub();
  }
};

/**
 * Deposit function
 *
 * @description Performs a deposit transaction on the Sygna Bridge.
 * @param {ApiPromise} api - The ApiPromise instance.
 * @param {InjectedAccountWithMeta} currentAccount - The current account instance.
 * @param {XcmMultiAssetIdType} xcmMultiAssetId - The XCM multi-asset ID type.
 * @param {string} amount - The amount to be deposited.
 * @param {string} domainId - The domain ID of the destination address.
 * @param {string} address - The destination address of the deposit transaction.
 * @param {DepositCallbacksType=} callbacks - Optional callbacks for success and error cases.
 */
export const deposit = async (
  api: ApiPromise,
  currentAccount: InjectedAccountWithMeta,
  xcmMultiAssetId: XcmMultiAssetIdType,
  amount: string,
  domainId: string,
  address: string,
  callbacks?: DepositCallbacksType,
): Promise<void> => {
  const convertedAmount = calculateBigNumber(api, amount);

  const xcmV1MultiassetFungibility = { fungible: convertedAmount.toString() };

  const destIdMultilocation = {
    parents: 0,
    interior: {
      x2: [{ generalKey: address }, { generalIndex: domainId }],
    },
  };
  const asset = { id: xcmMultiAssetId, fun: xcmV1MultiassetFungibility };

  let unsub: () => void;

  try {
    // finds an injector for an address
    const injector = await web3FromAddress(currentAccount.address);

    unsub = await api.tx.sygmaBridge
      .deposit(asset, destIdMultilocation)
      .signAndSend(currentAccount.address, { signer: injector.signer }, result => {
        handleTxExtrinsicResult(api, result, unsub, callbacks);
      });
  } catch (e) {
    console.error('Substrate deposit error: ', e);
    callbacks?.onError?.(e);
  }
};
