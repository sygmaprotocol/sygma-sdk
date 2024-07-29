import { BigNumber, utils } from 'ethers';

import {
  getEVMRecipientAddressInBytes,
  getSubstrateRecipientAddressInBytes,
  createERCDepositData,
  toHex,
  constructSubstrateRecipient,
  addressToHex,
} from '../helpers.js';

describe('createERCDepositData', () => {
  it('should return the correct deposit data', () => {
    const tokenAmount = BigInt(100);
    const recipientAddress = '0x1234567890123456789012345678901234567890';
    const expectedDepositData =
      '0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000141234567890123456789012345678901234567890';

    const depositData = createERCDepositData(tokenAmount, recipientAddress);

    expect(depositData).toEqual(expectedDepositData);
  });

  it('should return the correct deposit data - substrate', () => {
    const tokenAmount = BigInt(100);
    const recipientAddress = '46Hb742ujLfMA1nGsw95xTbjt6SzGSiNgXsjPQXyz3PoQuNQ';
    const expectedDepositData =
      '0x00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000027010200511f0100fac48520983815e2022ded67ca8d27b73d51b1b022284c48b4eccbb7a328d80f';

    const depositData = createERCDepositData(tokenAmount, recipientAddress, 2004);

    expect(depositData).toEqual(expectedDepositData);
  });

  it('should return the correct deposit data - bitcoin', () => {
    const tokenAmount = BigInt(100);
    const recipientAddress = 'tb1qsfyzl92pv7wkyaj0tfjdtwvcsj840p004jglvp';
    const expectedDepositData =
      '0x0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000002a746231717366797a6c3932707637776b79616a3074666a6474777663736a383430703030346a676c7670';

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

describe('addressToHex', () => {
  test('should convert p2tr address to hex', () => {
    const address = 'tb1pnyh5nayrmwux72guec3xy7qryjjww6tu9mev3d5347lqcwgus4jsd95d2r';
    const expectedHex =
      '746231706e7968356e6179726d777578373267756563337879377172796a6a7777367475396d65763364353334376c716377677573346a73643935643272';

    const result = addressToHex(address, address.length);
    expect(result).toEqual(expectedHex);
  });

  test('should convert p2wpkh address to hex', () => {
    const address = 'tb1qsfyzl92pv7wkyaj0tfjdtwvcsj840p004jglvp';
    const expectedHex =
      '746231717366797a6c3932707637776b79616a3074666a6474777663736a383430703030346a676c7670';

    const result = addressToHex(address, address.length);
    expect(result).toEqual(expectedHex);
  });
});
