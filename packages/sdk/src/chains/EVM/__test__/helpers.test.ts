import { BigNumber, utils } from 'ethers';
import { TypeRegistry } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
// import {
//   constructMainDepositData,
//   constructDepositDataEvmSubstrate,
//   getRecipientAddressInBytes,
// } from '../helpers';

import {
  getRecipientAddressInBytes,
  constructMainDepositData,
  constructDepositDataEvmSubstrate,
  toHex,
  addPadding,
  createERCDepositData,
} from '../helpers';
import * as helpers from '../helpers';

const registry = new TypeRegistry();

describe('constructMainDepositData', () => {
  it('should return the correct data', () => {
    const tokenStats = BigNumber.from(123);
    const destRecipient = Uint8Array.from([1, 2, 3]);
    const resultArray = Array(67).fill(0);
    resultArray[31] = 123;
    resultArray[63] = 3;
    resultArray[64] = 1;
    resultArray[65] = 2;
    resultArray[66] = 3;

    expect(constructMainDepositData(tokenStats, destRecipient)).toEqual(
      Uint8Array.from(resultArray),
    );
  });
});

describe('constructDepositDataEvmSubstrate', () => {
  it('should return the correct deposit data', () => {
    const tokenAmount = '100';
    const recipientAddress = '0x1234567890123456789012345678901234567890';
    const decimals = 18;
    const expectedBytesArr = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 107, 199, 94, 45, 99,
      16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 3, 18, 52, 86,
    ]);
    const expectedDepositData = '0x1234';

    jest.spyOn(utils, 'parseUnits').mockReturnValueOnce(BigNumber.from('100000000000000000000'));
    jest.spyOn(utils, 'isAddress').mockReturnValueOnce(true);
    jest.spyOn(utils, 'arrayify').mockReturnValueOnce(new Uint8Array([18, 52, 86]));
    jest.spyOn(utils, 'hexlify').mockReturnValueOnce(expectedDepositData);

    const depositData = constructDepositDataEvmSubstrate(tokenAmount, recipientAddress, decimals);

    expect(utils.parseUnits).toHaveBeenCalledWith(tokenAmount, decimals);
    expect(utils.isAddress).toHaveBeenCalledWith(recipientAddress);
    expect(utils.arrayify).toHaveBeenCalledWith(recipientAddress);
    expect(utils.hexlify).toHaveBeenCalledWith(expectedBytesArr);
    expect(depositData).toEqual(expectedDepositData);
  });
});

describe('getRecipientAddressInBytes', () => {
  it('should convert an EVM address to a Uint8Array of bytes', () => {
    const evmAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    expect(utils.isAddress(evmAddress)).toBeTruthy();

    const result = getRecipientAddressInBytes(evmAddress);
    const expectedResult = utils.arrayify(evmAddress);

    expect(result).toEqual(expectedResult);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('should convert a Substrate multilocation to a Uint8Array of bytes', () => {
    const addressPublicKeyInBytes = decodeAddress(
      '5CDQJk6kxvBcjauhrogUc9B8vhbdXhRscp1tGEUmniryF1Vt',
    );
    const addressPublicKeyHexString = utils.hexlify(addressPublicKeyInBytes);
    const substrateMultilocation = JSON.stringify({
      parents: 0,
      interior: {
        X1: {
          AccountId32: {
            network: { any: null },
            id: addressPublicKeyHexString,
          },
        },
      },
    });
    expect(utils.isAddress(substrateMultilocation)).toBeFalsy();

    const result = getRecipientAddressInBytes(substrateMultilocation);
    const expectedResult = registry
      .createType('MultiLocation', JSON.parse(substrateMultilocation))
      .toU8a();

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

describe('addPadding', () => {
  it('should pads a string with zeros', () => {
    const input = 'abc';
    const padding = 10;
    const expectedOutput = '0x00000000000000000abc';
    const actualOutput = addPadding(input, padding);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should pads a number with zeros', () => {
    const input = 123;
    const padding = 4;
    const expectedOutput = '0x00000123';
    const actualOutput = addPadding(input, padding);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should passes the correct arguments to hexZeroPad', () => {
    jest.spyOn(utils, 'hexZeroPad');
    const input = 42;
    const padding = 4;
    addPadding(input, padding);
    expect(utils.hexZeroPad).toHaveBeenCalledWith('0x42', padding);
  });
});

describe('createERCDepositData', () => {
  it('should create the correct deposit data for the given input', () => {
    // const tokenAmountOrID = BigNumber.from('12345');
    // const lenRecipientAddress = 20;
    const recipientAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    const toHexMock = jest.spyOn(helpers, 'toHex').mockImplementation(() => {
      return '0x0123';
    });

    const result = createERCDepositData('12345', recipientAddress);
    expect(result).toBe('0x00000000000000000000000000000000000000000000029d394a5d63054400000000000000000000000000000000000000000000000000000000000000000014742d35cc6634c0532925a3b844bc454e4438f44e');

    toHexMock.mockRestore();
  });
});
