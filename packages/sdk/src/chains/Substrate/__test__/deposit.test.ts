import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { XcmMultiAssetIdType } from '../../../types';

import * as Utils from '../utils';

jest.mock('@polkadot/api');
jest.mock('@polkadot/extension-inject/types');
jest.mock('react');

jest.mock('@polkadot/extension-dapp', () => ({
  web3FromAddress: jest.fn().mockResolvedValue({signer: jest.fn()}),
}));

describe('deposit', () => {
  let api: ApiPromise;
  let currentAccount: InjectedAccountWithMeta;
  let xcmMultiAssetId: XcmMultiAssetIdType;
  let amount: string;
  let domainId: string;
  let address: string;

  beforeEach(() => {
    api = new ApiPromise();

    currentAccount = { address: 'testaddress' } as unknown as InjectedAccountWithMeta;

    xcmMultiAssetId = { id: 1 } as unknown as XcmMultiAssetIdType;

    amount = '1000000000000';

    domainId = '1';

    address = 'testaddress';
    jest.spyOn(Utils, 'calculateBigNumber').mockReturnValue(new BN(110));
  });

  it('should call calculateBigNumber with correct params', async () => {
    const dispatchMockFn = jest.fn();
    const signAndSendMockFn = jest.fn();

    api = {
      tx: {
        sygmaBridge: {
          // @ts-ignore-line
          deposit: jest.fn().mockImplementationOnce(() =>{
            // @ts-ignore-line
            return ({ signAndSend: signAndSendMockFn })
        }),
        },
      },
    };

    await Utils.deposit(
      api,
      currentAccount,
      xcmMultiAssetId,
      amount,
      domainId,
      address,
      dispatchMockFn,
    );

    expect(Utils.calculateBigNumber).toHaveBeenCalledWith(api, amount);
  });

  it('should call web3FromAddress with correct params', async () => {
    const dispatchMockFn = jest.fn();
    const signAndSendMockFn = jest.fn();

    api = {
      tx: {
        sygmaBridge: {
          // @ts-ignore-line
          deposit: jest.fn().mockImplementationOnce(() =>{
            // @ts-ignore-line
            return ({ signAndSend: signAndSendMockFn })
        }),
        },
      },
    };

    await Utils.deposit(
      api,
      currentAccount,
      xcmMultiAssetId,
      amount,
      domainId,
      address,
      dispatchMockFn,
    );

    expect(web3FromAddress).toHaveBeenCalledWith(currentAccount.address);
  });

  it('should call sygmaBridge.deposit with correct params', async () => {
    const dispatchMockFn = jest.fn();
    const signAndSendMockFn = jest.fn();

    api = {
      tx: {
        sygmaBridge: {
          // @ts-ignore-line
          deposit: jest.fn().mockImplementationOnce(() =>{
            // @ts-ignore-line
            return ({ signAndSend: signAndSendMockFn })
        }),
        },
      },
    };

    await Utils.deposit(
      api,
      currentAccount,
      xcmMultiAssetId,
      amount,
      domainId,
      address,
      dispatchMockFn,
    );

    expect(api.tx.sygmaBridge.deposit).toHaveBeenCalledWith(
      {
        fun: {
          fungible: '110',
        },
        id: {
          id: 1,
        },
      },

      {
        parents: 0,
        interior: {
          x2: [{ generalKey: address }, { generalIndex: domainId }],
        },
      },
    );
  });


  it('should call signAndSend', async () => {
    const dispatchMockFn = jest.fn();
    const signAndSendMockFn = jest.fn();
    api = {
      tx: {
        sygmaBridge: {
          // @ts-ignore-line
          deposit: jest.fn().mockImplementationOnce(() =>{
            // @ts-ignore-line
            return ({ signAndSend: signAndSendMockFn })
        }),
        },
      },
    };

    await Utils.deposit(
      api,
      currentAccount,
      xcmMultiAssetId,
      amount,
      domainId,
      address,
      dispatchMockFn,
    );

    expect(signAndSendMockFn).toHaveBeenCalledTimes(1);
  });

  it('should call handleTxExtrinsicResult', async () => {
    // const api = new ApiPromise();
    const unsub = jest.fn();
    const dispatchMockFn = jest.fn();
    const signAndSendMockFn = jest.fn().mockImplementationOnce((account, options, callback) => {
      callback('someResult')
      Promise.resolve( unsub)
    });

    api = {
      tx: {
        sygmaBridge: {
          // @ts-ignore-line
          deposit: jest.fn().mockImplementationOnce(() =>{
            // @ts-ignore-line
            return ({ signAndSend: signAndSendMockFn })
          }),
        },
      },
    };
    jest.spyOn(Utils, 'handleTxExtrinsicResult').mockImplementation()
    await Utils.deposit(api, currentAccount, xcmMultiAssetId, amount, domainId, address, dispatchMockFn);
    expect(Utils.handleTxExtrinsicResult).toHaveBeenCalledTimes(1);
    expect(Utils.handleTxExtrinsicResult).toHaveBeenCalledWith(api, 'someResult', dispatchMockFn, undefined);
  });

  it('should reject in case of error', async () => {
    // const api = new ApiPromise();
    const unsub = jest.fn();
    const dispatchMockFn = jest.fn();
    const signAndSendMockFn = jest.fn().mockRejectedValue(new Error("Sick error"));
    api = {
      tx: {
        sygmaBridge: {
          // @ts-ignore-line
          deposit: jest.fn().mockImplementationOnce(() =>{
            // @ts-ignore-line
            return ({ signAndSend: signAndSendMockFn })
          }),
        },
      },
    };
    await expect(
      Utils.deposit(
        api,
        currentAccount,
        xcmMultiAssetId,
        amount,
        domainId,
        address,
        dispatchMockFn,
      ),
    ).rejects.toThrowError("Sick error");
  });
});
