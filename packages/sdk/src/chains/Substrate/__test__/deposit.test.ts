import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { XcmMultiAssetIdType } from '../types';
import { DepositCallbacksType } from '../utils/depositFns';

import * as Utils from '../utils/depositFns';

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
  let callbacksMockFns: DepositCallbacksType;

  beforeEach(() => {
    api = new ApiPromise();

    currentAccount = { address: 'testaddress' } as unknown as InjectedAccountWithMeta;

    xcmMultiAssetId = { id: 1 } as unknown as XcmMultiAssetIdType;

    amount = '1000000000000';

    domainId = '1';

    address = 'testaddress';
    jest.spyOn(Utils, 'calculateBigNumber').mockReturnValue(new BN(110));

    callbacksMockFns = {
      onInBlock: jest.fn(),
      onFinalized: jest.fn(),
      onError: jest.fn()
    }
  });

  it('should call calculateBigNumber with correct params', async () => {
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
      callbacksMockFns,
    );

    expect(Utils.calculateBigNumber).toHaveBeenCalledWith(api, amount);
  });

  it('should call web3FromAddress with correct params', async () => {
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
      callbacksMockFns,
    );

    expect(web3FromAddress).toHaveBeenCalledWith(currentAccount.address);
  });

  it('should call sygmaBridge.deposit with correct params', async () => {
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
      callbacksMockFns,
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
      callbacksMockFns,
    );

    expect(signAndSendMockFn).toHaveBeenCalledTimes(1);
  });

  it('should call handleTxExtrinsicResult', async () => {
    const unsub = jest.fn();
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
    await Utils.deposit(api, currentAccount, xcmMultiAssetId, amount, domainId, address, callbacksMockFns);
    expect(Utils.handleTxExtrinsicResult).toHaveBeenCalledTimes(1);
    expect(Utils.handleTxExtrinsicResult).toHaveBeenCalledWith(api, 'someResult', undefined, callbacksMockFns);
  });

  it('should reject in case of error', async () => {
    const unsub = jest.fn();
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
    await Utils.deposit(
      api,
      currentAccount,
      xcmMultiAssetId,
      amount,
      domainId,
      address,
      callbacksMockFns,
    )
    expect(callbacksMockFns.onError).toBeCalledWith(new Error("Sick error"));
  });
});
