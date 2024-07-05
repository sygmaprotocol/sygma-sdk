import { FeeHandlerType } from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';

import type { SubstrateAssetTransferRequest } from '../fungible.js';
import { createSubstrateFungibleAssetTransfer } from '../fungible.js';
import { deposit, getBasicFee, getFeeHandler, getPercentageFee } from '../utils/index.js';

jest.mock('@polkadot/util-crypto');
jest.mock('../utils/index.js');

describe('SubstrateFungibleAssetTransfer', () => {
  const transferRequest: SubstrateAssetTransferRequest = {
    sourceDomain: 5,
    destinationDomain: 1337,
    sourceNetworkProvider: {} as ApiPromise,
    resource: '0x0000000000000000000000000000000000000000000000000000000000000300',
    amount: BigInt(1000),
    destinationAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should validate Substrate address', async () => {
    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    expect(transfer.destinationAddress).toBe(transferRequest.destinationAddress);
  });

  test('should set the amount', async () => {
    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    transfer.setAmount(BigInt(2000));
    expect(transfer.amount).toBe(BigInt(2000));
  });

  test('should set the destination address', async () => {
    (isAddress as unknown as jest.Mock).mockReturnValue(true);
    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    transfer.setDestinationAddress('5DAAnrj7VHTznn4X9W4g5aPKMhVt6T3QhuxD9aTy4bqdS7uN');
    expect(transfer.destinationAddress).toBe('5DAAnrj7VHTznn4X9W4g5aPKMhVt6T3QhuxD9aTy4bqdS7uN');
  });

  test('should calculate the basic fee', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(100), type: FeeHandlerType.BASIC });

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    const fee = await transfer.getFee();
    expect(fee).toEqual({ fee: new BN(100), type: FeeHandlerType.BASIC });
  });

  test('should calculate the percentage fee', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.PERCENTAGE);
    (getPercentageFee as jest.Mock).mockResolvedValue({
      fee: new BN(50),
      type: FeeHandlerType.PERCENTAGE,
    });

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    const fee = await transfer.getFee();
    expect(fee).toEqual({ fee: new BN(50), type: FeeHandlerType.PERCENTAGE });
  });

  test('should throw error if transfer amount is less than the fee', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(2000), type: FeeHandlerType.BASIC });

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    await expect(transfer.getTransferTransaction()).rejects.toThrow(
      'Transfer amount should be higher than transfer fee',
    );
  });

  test('should return a valid transfer transaction', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(100), type: FeeHandlerType.BASIC });
    (deposit as jest.Mock).mockResolvedValue(
      {} as SubmittableExtrinsic<'promise', SubmittableResult>,
    );

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    const tx = await transfer.getTransferTransaction();
    expect(tx).toBeDefined();
  });
});
