import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
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
    jest.spyOn(Utils, 'calculateBigNumber').mockReturnValue(new BN(110));
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
    expect(Utils.createMultiAssetData).toHaveBeenCalledWith(xcmMultiAssetId, api, '1000000000000');
    expect(Utils.createDestIdMultilocationData).toHaveBeenCalledWith(
      Environment.LOCAL,
      address,
      domainId,
    );
    jest.resetAllMocks();
  });
});

describe('createMultiAssetData', () => {
  let api: ApiPromise;
  let xcmMultiAssetId: XcmMultiAssetIdType;
  let amount: string;

  beforeEach(() => {
    api = new ApiPromise();

    xcmMultiAssetId = { id: 1 } as unknown as XcmMultiAssetIdType;

    amount = '1000000000000';

    jest.spyOn(Utils, 'calculateBigNumber').mockReturnValue(new BN(110));
  });
  it('should call calculateBigNumber and return a multi-asset data object', () => {
    api = {} as unknown as ApiPromise;

    const result = Utils.createMultiAssetData(xcmMultiAssetId, api, amount);

    expect(Utils.calculateBigNumber).toHaveBeenCalledWith(api, amount);
    expect(result).toEqual({
      id: xcmMultiAssetId,
      fun: {
        fungible: '110',
      },
    });
  });
});
