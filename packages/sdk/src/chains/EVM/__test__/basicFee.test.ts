import type { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import { BasicFeeHandler__factory } from '@buildwithsygma/sygma-contracts';
import { calculateBasicfee } from '../fee/basicFee.js';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      BasicFeeHandler__factory: {
        connect: () => {
          return {
            calculateFee: () => Promise.resolve([BigNumber.from('0x174876e800'), '0x0']),
            _fee: () => Promise.resolve(BigNumber.from('0x174876e800')),
          };
        },
      },
    }) as unknown,
);

describe('CalculateBasicFee', () => {
  it('Should return the basic fee as BigNumber', async () => {
    const res = await calculateBasicfee({
      basicFeeHandlerAddress: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69',
      provider: {} as ethers.providers.JsonRpcProvider,
      sender: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      fromDomainID: 1,
      toDomainID: 2,
      resourceID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });

    const { fee } = res;

    expect(fee).toEqual(BigNumber.from('0x174876e800'));
  });

  it('Should throw an error', async () => {
    (BasicFeeHandler__factory.connect as unknown) = () =>
      Promise.resolve({
        calculateFee: () => Promise.reject(new Error('Fee Error')),
        _fee: () => Promise.resolve(BigNumber.from('0x174876e800')),
      });

    try {
      await calculateBasicfee({
        basicFeeHandlerAddress: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69',
        provider: {} as ethers.providers.JsonRpcProvider,
        sender: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
        fromDomainID: 1,
        toDomainID: 2,
        resourceID: '0x0000000000000000000000000000000000000000000000000000000000000000',
      });
    } catch (e) {
      expect((e as Error).message).toBe('BasicFeeHandlerInstance.calculateFee is not a function');
    }
  });
});
