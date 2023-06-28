import { ApiPromise } from '@polkadot/api';
import { XcmMultiAssetIdType } from '../types';

import * as Utils from '../utils/depositFns.js';
import { Environment } from '../../../types';

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

describe('createMultiAssetData', () => {
  let xcmMultiAssetId: XcmMultiAssetIdType;
  let amount: string;

  beforeEach(() => {
    xcmMultiAssetId = { id: 1 } as unknown as XcmMultiAssetIdType;
    amount = '1000000000000';
  });
  it('should return a multi-asset data object', () => {
    const result = Utils.createMultiAssetData(xcmMultiAssetId, amount);

    expect(result).toEqual({
      id: xcmMultiAssetId,
      fun: {
        fungible: '1000000000000',
      },
    });
  });
});
