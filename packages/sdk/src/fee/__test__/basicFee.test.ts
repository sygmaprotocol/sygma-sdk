/* eslint-disable */

import { BigNumber, ethers } from 'ethers';
import { FeeDataResult } from '../../types';
import { BasicFeeHandler__factory } from '@buildwithsygma/sygma-contracts';
import { calculateBasicfee } from '../basicFee';

jest.mock('@buildwithsygma/sygma-contracts', () => ({
  ...jest.requireActual('@buildwithsygma/sygma-contracts'),
  BasicFeeHandler__factory: {
    connect: () => {
      console.log('connect');
      return {
        calculateFee: async () => [BigNumber.from('0x174876e800'), '0x0'],
        _fee: async () => BigNumber.from('0x174876e800'),
      };
    },
  },
}));

describe('CalculateBasicFee', () => {
  it('Should return the basic fee in hex form', async () => {
    const res = await calculateBasicfee({
      basicFeeHandlerAddress: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69',
      provider: {} as ethers.providers.JsonRpcProvider,
      sender: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      fromDomainID: '1',
      toDomainID: '2',
      resourceID: '0x0000000000000000000000000000000000000000000000000000000000000000',
      tokenAmount: 100,
      recipientAddress: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
    });

    const { calculatedRate } = res as FeeDataResult;

    expect(calculatedRate).toBe('0.0000001');
  });

  it('Should return and error', async () => {
    (BasicFeeHandler__factory.connect as unknown) = async () => {
      return {
        calculateFee: async () => Promise.reject(new Error('Fee Error')),
        _fee: async () => BigNumber.from('0x174876e800'),
      };
    };

    jest.spyOn(console, 'error');

    try {
      await calculateBasicfee({
        basicFeeHandlerAddress: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69',
        provider: {} as ethers.providers.JsonRpcProvider,
        sender: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
        fromDomainID: '1',
        toDomainID: '2',
        resourceID: '0x0000000000000000000000000000000000000000000000000000000000000000',
        tokenAmount: 100,
        recipientAddress: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      });
    } catch (e) {
      expect(console.error).toHaveBeenCalled();
      expect((e as Error).message).toBe('Invalidad basic fee response');
    }
  });
});
