import { ApiPromise } from '@polkadot/api';
import type { XcmMultiAssetIdType } from '../types/index.js';

import * as Utils from '../utils/depositFns.js';
import { Environment } from '../../../types/index.js';

jest.mock('@polkadot/api');

describe('deposit', () => {
  let api: ApiPromise;
  let xcmMultiAssetId: XcmMultiAssetIdType;
  let amount: string;
  let domainId: string;
  let address: string;

  beforeEach(() => {
    api = new ApiPromise();

    xcmMultiAssetId = { id: 1 } as unknown as XcmMultiAssetIdType;

    amount = '1000000000000';

    domainId = '1';

    address = 'testaddress';
  });

  it('should return a multi-asset data object', () => {
    const result = Utils.createMultiAssetData(
      { id: 1 } as unknown as XcmMultiAssetIdType,
      '1000000000000',
    );
    expect(result).toEqual({
      id: { id: 1 },
      fun: {
        fungible: '1000000000000',
      },
    });
  });

  it('should call calculateBigNumber with correct params', () => {
    const signAndSendMockFn = jest.fn();
    jest.spyOn(Utils, 'createMultiAssetData').mockReturnValue({
      id: { id: 1 },
      fun: {
        fungible: '100000000000000000',
      },
    });

    jest.spyOn(Utils, 'createDestIdMultilocationData');

    api = {
      tx: {
        sygmaBridge: {
          deposit: jest.fn().mockImplementationOnce(() => {
            return { signAndSend: signAndSendMockFn };
          }),
        },
      },
    } as unknown as ApiPromise;

    Utils.deposit(Environment.LOCAL, api, xcmMultiAssetId, amount, domainId, address);
    expect(Utils.createMultiAssetData).toHaveBeenCalledWith(xcmMultiAssetId, '1000000000000');
    expect(Utils.createDestIdMultilocationData).toHaveBeenCalledWith(
      Environment.LOCAL,
      address,
      domainId,
    );
    jest.resetAllMocks();
  });
});
