import type { XcmMultiAssetIdType } from '@buildwithsygma/core';
import { Environment } from '@buildwithsygma/core';
import type { ApiPromise } from '@polkadot/api';
import { numberToHex } from '@polkadot/util';

import { createDestIdMultilocationData, deposit } from '../../../utils/index.js';

describe('createDestIdMultilocationData', () => {
  it('should create multilocation data for LOCAL environment', () => {
    const address = '0x123abc';
    const domainId = '42';
    const data = createDestIdMultilocationData(address, domainId);

    expect(data).toEqual({
      parents: 0,
      interior: {
        x2: [
          { generalKey: [(address.length - 2) / 2, address.padEnd(66, '0')] },
          { generalKey: [1, numberToHex(Number(domainId)).padEnd(66, '0')] },
        ],
      },
    });
  });

  it('should create multilocation data for non-LOCAL environment', () => {
    process.env.SYGMA_ENV = Environment.DEVNET;
    const address = '0x123abc';
    const domainId = '42';
    const data = createDestIdMultilocationData(address, domainId);

    expect(data).toEqual({
      parents: 0,
      interior: {
        x3: [
          { generalKey: [5, '0x7379676d61000000000000000000000000000000000000000000000000000000'] },
          { generalIndex: numberToHex(Number(domainId)) },
          { generalKey: [(address.length - 2) / 2, address.padEnd(66, '0')] },
        ],
      },
    });
  });
});

describe('deposit', () => {
  process.env.SYGMA_ENV = Environment.LOCAL;
  it('should create a deposit transaction', () => {
    const xcmMultiAssetId: XcmMultiAssetIdType = {
      concrete: {
        parents: 1,
        interior: {
          x3: [
            { parachain: 2000 },
            { generalKey: [1, 'someKey'] },
            { generalKey: [2, 'anotherKey'] },
          ],
        },
      },
    };
    const amount = '1000';
    const destinationDomainId = '1';
    const destinationAddress = '0x7379676d610';

    const mockApi = {
      tx: {
        sygmaBridge: {
          deposit: jest.fn(),
        },
      },
    } as unknown as ApiPromise;

    deposit(mockApi, xcmMultiAssetId, amount, destinationDomainId, destinationAddress);

    expect(mockApi.tx.sygmaBridge.deposit).toHaveBeenCalledWith(
      {
        id: xcmMultiAssetId,
        fun: {
          fungible: amount,
        },
      },
      {
        parents: 0,
        interior: {
          x2: [
            {
              generalKey: [
                (destinationAddress.length - 2) / 2,
                '0x7379676d61000000000000000000000000000000000000000000000000000000',
              ],
            },
            { generalKey: [1, numberToHex(Number(destinationDomainId)).padEnd(66, '0')] },
          ],
        },
      },
    );
  });
});
