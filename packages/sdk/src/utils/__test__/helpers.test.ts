import { BigNumber, utils } from 'ethers';
import { TypeRegistry } from '@polkadot/types';
import {
  constructMainDepositData,
  createERCDepositData,
  getRecipientAddressInBytes,
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
  it('should return the correct deposit data if it is EVM address', () => {
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
    jest
      .spyOn(helpers, 'getRecipientAddressInBytes')
      .mockReturnValueOnce(new Uint8Array([18, 52, 86]));
    jest.spyOn(utils, 'hexlify').mockReturnValueOnce(expectedDepositData);

    const depositData = createERCDepositData(tokenAmount, recipientAddress, decimals);

    expect(utils.parseUnits).toHaveBeenCalledWith(tokenAmount, decimals);
    expect(helpers.getRecipientAddressInBytes).toHaveBeenCalledWith(recipientAddress);
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
  });

  it('should convert a Substrate multilocation to a Uint8Array of bytes', () => {
    const substrateMultilocation = JSON.stringify({
      parents: 0,
      interior: {
        X1: {
          AccountId32: {
            network: { any: null },
            id: '0x06a220edf5f82b84fc5f9270f8a30a17636bf29c05a5c16279405ca20918aa39',
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
  });
});
