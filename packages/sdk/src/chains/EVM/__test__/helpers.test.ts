import { BigNumber, utils } from 'ethers';

import {
  getEVMRecipientAddressInBytes,
  getSubstrateRecipientAddressInBytes,
  createERCDepositData,
  toHex,
  createPermissionedGenericDepositData,
  constructSubstrateRecipient,
} from '../helpers.js';
import * as helpers from '../helpers.js';

describe('createERCDepositData', () => {
  it('should return the correct deposit data', () => {
    const tokenAmount = '100';
    const recipientAddress = '0x1234567890123456789012345678901234567890';
    const expectedDepositData =
      '0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000141234567890123456789012345678901234567890';

    const depositData = createERCDepositData(tokenAmount, recipientAddress);

    expect(depositData).toEqual(expectedDepositData);
  });
});

describe('constructSubstrateRecipient', () => {
  it('should create a valid Substrate Multilocation Object with parachain id', () => {
    const substrateAddress = '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt';
    const result = constructSubstrateRecipient(substrateAddress, 2004);
    const expectedResult =
      '{"parents":1,"interior":{"X2":[{"parachain":2004},{"AccountId32":{"network":{"any":null},"id":"0x06a220edf5f82b84fc5f9270f8a30a17636bf29c05a5c16279405ca20918aa39"}}]}}';
    expect(result).toEqual(expectedResult);
  });

  it('should create a valid Substrate Multilocation Object', () => {
    const substrateAddress = '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt';
    const result = constructSubstrateRecipient(substrateAddress);
    const expectedResult =
      '{"parents":0,"interior":{"X1":{"AccountId32":{"network":{"any":null},"id":"0x06a220edf5f82b84fc5f9270f8a30a17636bf29c05a5c16279405ca20918aa39"}}}}';
    expect(result).toEqual(expectedResult);
  });
});

describe('getEVMRecipientAddressInBytes', () => {
  it('should convert an EVM address to a Uint8Array of bytes', () => {
    const evmAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    expect(utils.isAddress(evmAddress)).toBeTruthy();

    const result = getEVMRecipientAddressInBytes(evmAddress);
    const expectedResult = utils.arrayify(evmAddress);

    expect(result).toEqual(expectedResult);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});

describe('getSubstrateRecipientAddressInBytes', () => {
  it('should convert a Substrate address to a Uint8Array of bytes', () => {
    const substrateAddress = '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt';

    expect(utils.isAddress(substrateAddress)).toBeFalsy();

    const result = getSubstrateRecipientAddressInBytes(substrateAddress);
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

    const result = getSubstrateRecipientAddressInBytes(substrateAddress, 1001);
    const expectedResult = Uint8Array.from([
      1, 2, 0, 165, 15, 1, 0, 6, 162, 32, 237, 245, 248, 43, 132, 252, 95, 146, 112, 248, 163, 10,
      23, 99, 107, 242, 156, 5, 165, 193, 98, 121, 64, 92, 162, 9, 24, 170, 57,
    ]);

    expect(result).toEqual(expectedResult);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});

describe('toHex', () => {
  test('should convert string to hex', () => {
    const result = toHex('1234', 6);
    expect(result).toBe('0x0000000004d2');
  });

  test('should convert number to hex', () => {
    const result = toHex(5678, 8);
    expect(result).toBe('0x000000000000162e');
  });

  test('should convert BigNumber to hex', () => {
    const num = BigNumber.from('900000000000000000000000');
    const result = toHex(num, 32);
    expect(result).toBe('0x00000000000000000000000000000000000000000000be951906eba2aa800000');
  });
});

describe('createPermissionlessGenericDepositData', () => {
  test('should return correct value', () => {
    const executeFunctionSignature = '0x12345678';
    const executeContractAddress = '0xabcdef1234567890';
    const maxFee = '0x1000';
    const depositor = '0x1234abcd5678ef90';
    const executionData = '0x0102030405060708';

    const result = helpers.createPermissionlessGenericDepositData(
      executeFunctionSignature,
      executeContractAddress,
      maxFee,
      depositor,
      executionData,
    );

    expect(result).toEqual(
      '0x000000000000000000000000000000000000000000000000000000000000100000041234567808abcdef1234567890081234abcd5678ef900102030405060708',
    );
  });
});

describe('createPermissionedGenericDepositData', () => {
  it('should create depositData for permissioned generic handler', () => {
    const hexMetaData = '0x68656c6c6f776f726c64'; // 'helloworld' in hex
    const expectedResult =
      '0x000000000000000000000000000000000000000000000000000000000000000a68656c6c6f776f726c64';

    const result = createPermissionedGenericDepositData(hexMetaData);

    expect(result).toBe(expectedResult);
  });

  it('should handle an empty hex string', () => {
    const hexMetaData = '0x';
    const expectedResult = '0x0000000000000000000000000000000000000000000000000000000000000000';

    const result = createPermissionedGenericDepositData(hexMetaData);

    expect(result).toBe(expectedResult);
  });
});
