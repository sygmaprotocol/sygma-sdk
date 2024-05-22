import { BN, numberToHex } from '@polkadot/util';
import { Environment } from '../../../types/index.js';
/**
 * Calculates a big number from an amount and chain decimals retrived from API.
 *
 * @category Bridge deposit
 * @param {ApiPromise} api - An API Promise object.
 * @param {string} amount - The amount to be converted.
 * @returns {BN} The converted amount as a BN object.
 */
export const calculateBigNumber = (api, amount) => {
    const bnAmount = new BN(Number(amount));
    const bnBase = new BN(10);
    const bnDecimals = new BN(api.registry.chainDecimals[0]);
    const convertAmount = bnAmount.mul(bnBase.pow(bnDecimals));
    return convertAmount;
};
/**
 * Throw errors from a SubmittableResult.
 *
 * @category Bridge deposit
 * @param {ApiPromise} api - The ApiPromise instance used to find meta errors.
 * @param {SubmittableResult} result - The SubmittableResult to log errors from.
 * @param {() => void} unsub - A function to stop listen for events.
 */
export const throwErrorIfAny = (api, result, unsub) => {
    const { events = [], status } = result;
    if (status.isInBlock || status.isFinalized) {
        events
            // find/filter for failed events
            .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
            // we know that data for system.ExtrinsicFailed is
            // (DispatchError, DispatchInfo)
            .forEach(({ event: { data } }) => {
            const error = data[0];
            unsub(); // unsubscribe from subscription
            if (error.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(error.asModule);
                const { docs, method, section } = decoded;
                throw new Error(`${section}.${method}: ${docs.join(' ')}`);
            }
            else {
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
 * @param {DepositCallbacksType=} callbacks - Optional callbacks for success and error cases.
 */
export const handleTxExtrinsicResult = (api, result, unsub, callbacks) => {
    const { status } = result;
    console.log(`Current status is ${status.toString()}`);
    // if error has been found in events log the error and unsubsribe
    throwErrorIfAny(api, result, unsub);
    if (status.isInBlock) {
        console.log(`Transaction included at blockHash ${status.asInBlock.toString()}`);
        callbacks?.onInBlock?.(status);
    }
    else if (status.isFinalized) {
        console.log(`Transaction finalized at blockHash ${status.asFinalized.toString()}`);
        result.events.forEach(({ event: { data, method, section } }) => {
            // Search for Deposit event
            if (section === 'sygmaBridge' && method === 'Deposit') {
                console.log(`${section}.${method}.event data:`, data.toHuman());
                callbacks?.onDepositEvent?.(data.toHuman());
            }
        });
        callbacks?.onFinalized?.(status);
        unsub();
    }
};
/**
 * Creates a destination multilocation object for the deposit transaction.
 *
 * @example
 * const address = '0x123abc';
 * const domainId = '42';
 * const multilocationData = createDestIdMultilocationData(address, domainId);
 * console.log(multilocationData);
 * // Output: {
 * //   parents: 0,
 * //   interior: {
 * //     x3: [
 * //       { generalKey: '0x7379676d61000000000000000000000000000000000000000000000000000000'}
 * //       { generalIndex: '0x2a' }
 * //       { generalKey: '0x123abc' },
 * //     ]
 * //   }
 * // }
 *
 * @category Bridge deposit
 * @param {Environment} environment - The environment from which the transfer is being made
 * @param {string} address - The recipient address.
 * @param {string} domainId - The domain identifier.
 * @returns {object} - The destination multilocation object.
 */
export const createDestIdMultilocationData = (environment, address, domainId) => {
    switch (environment) {
        case Environment.LOCAL:
            return {
                parents: 0,
                interior: {
                    x2: [
                        { generalKey: [(address.length - 2) / 2, address.padEnd(66, '0')] },
                        { generalKey: [1, numberToHex(Number(domainId)).padEnd(66, '0')] },
                    ],
                },
            };
        default:
            return {
                parents: 0,
                interior: {
                    x3: [
                        // This is the `sygma` multilocation path
                        {
                            generalKey: [5, '0x7379676d61000000000000000000000000000000000000000000000000000000'],
                        },
                        { generalIndex: numberToHex(Number(domainId)) },
                        { generalKey: [(address.length - 2) / 2, address.padEnd(66, '0')] },
                    ],
                },
            };
    }
};
/**
 * Creates an MultiAsset data for the deposit transaction.
 *
 * @category Bridge deposit
 * @param {XcmMultiAssetIdType} xcmMultiAssetId - The XCM multi-asset identifier.
 * @param {string} amount - The deposit amount, in human-readable form.
 * @returns {object} - The asset object.
 */
export const createMultiAssetData = (xcmMultiAssetId, amount) => ({
    id: xcmMultiAssetId,
    fun: {
        fungible: amount,
    },
});
/**
 * Performs a deposit extrinsic transaction
 *
 * @example
 * const injector = await web3FromAddress(currentAccount.address);
 * const unsub = await deposit(api, asset, amount, domainId, address)
 *   .signAndSend(currentAccount.address, { signer: injector.signer }, result => {
 *      handleTxExtrinsicResult(api, result, unsub, callbacks);
 *    });
 *
 * @category Bridge deposit
 * @param environment
 * @param {ApiPromise} api - The ApiPromise instance.
 * @param {XcmMultiAssetIdType} xcmMultiAssetId - The XCM multi-asset ID type.
 * @param {string} amount - The amount to be deposited.
 * @param {string} destinationDomainId - The domain ID of the destination address.
 * @param {string} destinationAddress - The destination address of the deposit transaction.
 * @returns {SubmittableExtrinsic<"promise", SubmittableResult>} - A SubmittableExtrinsic representing the deposit transaction.
 */
export const deposit = (environment, api, xcmMultiAssetId, amount, destinationDomainId, destinationAddress) => {
    const asset = createMultiAssetData(xcmMultiAssetId, amount);
    const destIdMultilocation = createDestIdMultilocationData(environment, destinationAddress, destinationDomainId);
    return api.tx.sygmaBridge.deposit(asset, destIdMultilocation);
};
//# sourceMappingURL=depositFns.js.map