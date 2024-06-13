import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { DispatchError, ExtrinsicStatus } from '@polkadot/types/interfaces';

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
 * @example
 * handleTxExtrinsicResult(api, result, unsub, {
 *   onInBlock: (status) => console.log('Transaction in block:', status),
 *   onDepositEvent: (data) => console.log('Deposit event data:', data),
 *   onFinalized: (status) => console.log('Transaction finalized:', status),
 * });
 *
 * @category Bridge deposit
 * @param {ApiPromise} api - The API promise object.
 * @param {SubmittableResult} result - The submittable result object.
 * @param {Function} unsub - A function to stop listen for events.
 * @param {DepositCallbacksType} callbacks - Optional callbacks for success and error cases.
 */
export const handleTxExtrinsicResult = (
  api: ApiPromise,
  result: SubmittableResult,
  unsub: () => void,
  callbacks?: DepositCallbacksType,
): void => {
  const { status } = result;
  console.log(`Current status is ${status.toString()}`);

  // if error has been found in events, log the error and unsubscribe
  throwErrorIfAny(api, result, unsub);

  if (status.isInBlock) {
    console.log(`Transaction included at blockHash ${status.asInBlock.toString()}.`);
    callbacks?.onInBlock?.(status);
  } else if (status.isFinalized) {
    console.log(`Transaction finalized at blockHash ${status.asFinalized.toString()}.`);

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
