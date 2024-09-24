import { Network } from '@buildwithsygma/core';
import { arrayify } from '@ethersproject/bytes';
import { utils } from 'ethers';

import {
  createAssetDepositData,
  createSubstrateMultiLocationObject,
  serializeEvmAddress,
  serializeSubstrateAddress,
} from '../assetTransferHelpers.js';

describe('createERCDepositData', () => {
  it('should return the correct deposit data', () => {
    const amount = BigInt(100);
    const recipientAddress = '0x1234567890123456789012345678901234567890';
    const expectedDepositData =
      '0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000141234567890123456789012345678901234567890';

    const depositData = createAssetDepositData({
      recipientAddress,
      amount,
      destination: {
        name: 'EVM',
        type: Network.EVM,
        caipId: '11',
        chainId: 1,
        id: 1,
      },
      isNativeToken: false,
    });

    expect(depositData).toEqual(expectedDepositData);
  });

  it('should return the correct deposit data - substrate', () => {
    const amount = BigInt(100);
    const recipientAddress = '46Hb742ujLfMA1nGsw95xTbjt6SzGSiNgXsjPQXyz3PoQuNQ';
    const expectedDepositData =
      '0x00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000027010200511f0100fac48520983815e2022ded67ca8d27b73d51b1b022284c48b4eccbb7a328d80f';

    const depositData = createAssetDepositData({
      recipientAddress,
      amount,
      destination: {
        name: 'EVM',
        type: Network.SUBSTRATE,
        caipId: '11',
        chainId: 1,
        id: 1,
        parachainId: 2004,
      },
      isNativeToken: false,
    });

    expect(depositData).toEqual(expectedDepositData);
  });

  it('should return the correct deposit data - bitcoin', () => {
    const tokenAmount = BigInt(100);
    const recipientAddress = 'tb1qsfyzl92pv7wkyaj0tfjdtwvcsj840p004jglvp';
    const expectedDepositData =
      '0x0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000002a746231717366797a6c3932707637776b79616a3074666a6474777663736a383430703030346a676c7670';

    const depositData = createAssetDepositData({
      recipientAddress,
      amount: tokenAmount,
      destination: {
        name: 'bitcoin',
        type: Network.BITCOIN,
        caipId: '11',
        chainId: 1,
        id: 1,
      },
      isNativeToken: false,
    });
    expect(depositData).toEqual(expectedDepositData);
  });
});

describe('createSubstrateMultiLocationObject', () => {
  it('should create a valid Substrate Multilocation Object with parachain id', () => {
    const substrateAddress = '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt';
    const result = createSubstrateMultiLocationObject(substrateAddress, 2004);
    const expectedResult =
      '{"parents":1,"interior":{"X2":[{"parachain":2004},{"AccountId32":{"network":{"any":null},"id":"0x06a220edf5f82b84fc5f9270f8a30a17636bf29c05a5c16279405ca20918aa39"}}]}}';
    expect(result).toEqual(expectedResult);
  });

  it('should create a valid Substrate Multilocation Object', () => {
    const substrateAddress = '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt';
    const result = createSubstrateMultiLocationObject(substrateAddress);
    const expectedResult =
      '{"parents":0,"interior":{"X1":{"AccountId32":{"network":{"any":null},"id":"0x06a220edf5f82b84fc5f9270f8a30a17636bf29c05a5c16279405ca20918aa39"}}}}';
    expect(result).toEqual(expectedResult);
  });
});

describe('serializeEvmAddress', () => {
  it('should convert an EVM address to a Uint8Array of bytes', () => {
    const evmAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    expect(utils.isAddress(evmAddress)).toBeTruthy();

    const result = serializeEvmAddress(evmAddress);
    const expectedResult = utils.arrayify(evmAddress);

    expect(result).toEqual(expectedResult);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});

describe('getSubstrateRecipientAddressInBytes', () => {
  it('should convert a Substrate address to a Uint8Array of bytes', () => {
    const substrateAddress = '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt';

    expect(utils.isAddress(substrateAddress)).toBeFalsy();

    const result = arrayify(serializeSubstrateAddress(substrateAddress));
    const expectedResult = Uint8Array.from([
      0, 1, 1, 0, 6, 162, 32, 237, 245, 248, 43, 132, 252, 95, 146, 112, 248, 163, 10, 23, 99, 107,
      242, 156, 5, 165, 193, 98, 121, 64, 92, 162, 9, 24, 170, 57,
    ]);

    expect(result).toEqual(expectedResult);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('should convert a Substrate address on a different parachain to a Uint8Array of bytes', () => {
    const substrateAddress = '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt';

    expect(utils.isAddress(substrateAddress)).toBeFalsy();

    const result = arrayify(serializeSubstrateAddress(substrateAddress, 1001));
    const expectedResult = Uint8Array.from([
      1, 2, 0, 165, 15, 1, 0, 6, 162, 32, 237, 245, 248, 43, 132, 252, 95, 146, 112, 248, 163, 10,
      23, 99, 107, 242, 156, 5, 165, 193, 98, 121, 64, 92, 162, 9, 24, 170, 57,
    ]);

    expect(result).toEqual(expectedResult);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});
