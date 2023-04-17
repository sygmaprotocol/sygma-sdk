import { BigNumber, utils, providers } from 'ethers';
import { TypeRegistry } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';
import { ERC20 } from '@buildwithsygma/sygma-contracts';

import {
  getRecipientAddressInBytes,
  constructMainDepositData,
  createERCDepositData,
  toHex,
  addPadding,
  isUint8,
  createPermissionedGenericDepositData,
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

describe('createERCDepositData', () => {
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

    const depositData = createERCDepositData(tokenAmount, recipientAddress, decimals);

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

describe('createPermissionlessGenericDepositData', () => {
  let toHexSpy: jest.SpyInstance;

  beforeEach(() => {
    toHexSpy = jest.spyOn(helpers, 'toHex');
  });

  afterEach(() => {
    toHexSpy.mockRestore();
  });

  test('should return correct value when depositorCheck is true', () => {
    const executeFunctionSignature = '0x12345678';
    const executeContractAddress = '0xabcdef1234567890';
    const maxFee = '0x1000';
    const depositor = '0x1234abcd5678ef90';
    const executionData = '0x0102030405060708';
    // const depositorCheck = true;

    toHexSpy.mockReturnValue('mockedHexValue');

    const result = helpers.createPermissionlessGenericDepositData(
      executeFunctionSignature,
      executeContractAddress,
      maxFee,
      depositor,
      executionData,
      // depositorCheck,
    );

    expect(result).toEqual(
      '0xckedhexvalueckedhexvalue12345678ckedhexvalueabcdef1234567890ckedhexvalueckedhexvalue0102030405060708ckedhexvalue',
    );
  });

  test('should return correct value when depositorCheck is false', () => {
    const executeFunctionSignature = '0x12345678';
    const executeContractAddress = '0xabcdef1234567890';
    const maxFee = '0x1000';
    const depositor = '0x1234abcd5678ef90';
    const executionData = '0x0102030405060708';
    const depositorCheck = false;

    toHexSpy.mockReturnValue('mockedHexValue');

    const result = helpers.createPermissionlessGenericDepositData(
      executeFunctionSignature,
      executeContractAddress,
      maxFee,
      depositor,
      executionData,
      depositorCheck,
    );

    expect(result).toEqual(
      '0xckedhexvalueckedhexvalue12345678ckedhexvalueabcdef1234567890ckedhexvalueckedhexvalue0102030405060708',
    );
  });
});

describe('getTokenDecimals', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it('should return the decimal value of the token instance if it is an ERC20 token', async () => {
    // Given
    const tokenInstance = {
      decimals: jest.fn().mockResolvedValue(18),
    } as unknown as ERC20;
    jest.spyOn(helpers, 'isERC20').mockReturnValue(true);

    // When
    const decimals = await helpers.getTokenDecimals(tokenInstance);

    // Then
    expect(helpers.isERC20).toHaveBeenCalledWith(tokenInstance);
    expect(decimals).toBe(18);
  });

  it('should throw an error if the token instance is not an ERC20 token', async () => {
    const tokenInstance = {} as unknown as ERC20;
    jest.spyOn(helpers, 'isERC20').mockReturnValue(false);

    await expect(helpers.getTokenDecimals(tokenInstance)).rejects.toThrow(
      'Token instance is not ERC20',
    );
    expect(helpers.isERC20).toHaveBeenCalledWith(tokenInstance);
  });
});

describe('isERC20', () => {
  it('should return true when given an ERC20 token instance', () => {
    const tokenInstance = {
      name: 'MockToken',
      symbol: 'MT',
      decimals: 18,
    } as unknown as ERC20;
    const result = helpers.isERC20(tokenInstance);
    expect(result).toBe(true);
  });

  it('should return false when given a non-ERC20 token instance', () => {
    const tokenInstance = {
      id: 123,
      name: 'MockToken',
      totalSupply: 100000,
    } as unknown as ERC20;
    const result = helpers.isERC20(tokenInstance);
    expect(result).toBe(false);
  });
});

describe('isUint8', () => {
  it('returns true for values between 0 and 255', () => {
    expect(isUint8(0)).toBe(true);
    expect(isUint8(127)).toBe(true);
    expect(isUint8(255)).toBe(true);
  });

  it('returns false for values outside the range of 0 to 255', () => {
    expect(isUint8(-1)).toBe(false);
    expect(isUint8(256)).toBe(false);
    expect(() => isUint8('not a number' as unknown)).toThrowError();
  });
});

describe('isEIP1559MaxFeePerGas', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the gas price if the node is not EIP1559', async () => {
    const mockProvider: Partial<providers.Provider> = {
      getFeeData: jest.fn().mockResolvedValue({ gasPrice: BigNumber.from(100) }),
    };

    const result = await helpers.isEIP1559MaxFeePerGas(mockProvider as providers.Provider);

    expect(mockProvider.getFeeData).toHaveBeenCalledTimes(1);
    expect(result).toEqual(BigNumber.from(100));
  });

  it('should throw an error if there is an issue getting EIP1559 data', async () => {
    const error = new Error('Error getting EIP 1559 data');
    const mockProvider: Partial<providers.Provider> = {
      getFeeData: jest.fn().mockRejectedValue(error),
    };

    await expect(helpers.isEIP1559MaxFeePerGas(mockProvider as providers.Provider)).rejects.toThrow(
      error,
    );

    expect(mockProvider.getFeeData).toHaveBeenCalledTimes(1);
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
