

import { constructMainDepositData, constructDepositDataEvmSubstrate } from '../helpers';
import { BigNumber, utils } from 'ethers';

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
    expect(constructMainDepositData(tokenStats, destRecipient)).toEqual(Uint8Array.from(resultArray));
  })
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
