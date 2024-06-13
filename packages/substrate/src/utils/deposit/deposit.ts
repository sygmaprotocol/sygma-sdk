import type { XcmMultiAssetIdType } from '@buildwithsygma/core';
import { Environment } from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { numberToHex } from '@polkadot/util';

/*
 * @category Bridge deposit
 * @param {Environment} environment - The environment from which the transfer is being made
 * @param {string} address - The recipient address.
 * @param {string} domainId - The domain identifier.
 * @returns {object} - The destination multilocation object.
 */
export const createDestIdMultilocationData = (address: string, domainId: string): object => {
  const environment = process.env.SYGMA_ENV as Environment;

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
            // This is the `sygma` multiplication path
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
export const createMultiAssetData = (
  xcmMultiAssetId: XcmMultiAssetIdType,
  amount: string,
): object => ({
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
 * const unsub = await deposit(api, xcmMultiAssetId, amount, destinationDomainId, destinationAddress)
 *   .signAndSend(currentAccount.address, { signer: injector.signer }, result => {
 *      handleTxExtrinsicResult(api, result, unsub, callbacks);
 *    });
 *
 * @category Bridge deposit
 * @param {ApiPromise} api - The ApiPromise instance.
 * @param {XcmMultiAssetIdType} xcmMultiAssetId - The XCM multi-asset ID type.
 * @param {string} amount - The amount to be deposited.
 * @param {string} destinationDomainId - The domain ID of the destination address.
 * @param {string} destinationAddress - The destination address of the deposit transaction.
 * @returns {SubmittableExtrinsic<"promise", SubmittableResult>} - A SubmittableExtrinsic representing the deposit transaction.
 */
export const deposit = (
  api: ApiPromise,
  xcmMultiAssetId: XcmMultiAssetIdType,
  amount: string,
  destinationDomainId: string,
  destinationAddress: string,
): SubmittableExtrinsic<'promise', SubmittableResult> => {
  const asset = createMultiAssetData(xcmMultiAssetId, amount);
  const destIdMultilocation = createDestIdMultilocationData(
    destinationAddress,
    destinationDomainId,
  );

  return api.tx.sygmaBridge.deposit(asset, destIdMultilocation);
};
