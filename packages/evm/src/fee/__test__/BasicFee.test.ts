import { FeeHandlerType } from '@buildwithsygma/core';
import type { JsonRpcBatchProvider } from '@ethersproject/providers';
import { constants } from 'ethers';
import { BasicFeeCalculator } from '../BasicFee.js';
import type { EvmFeeCalculationParams } from '../types.js';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      BasicFeeHandler__factory: {
        connect: jest.fn().mockReturnValue({
          calculateFee: () => Promise.resolve([constants.Zero]),
        }),
      },
    }) as unknown,
);

describe('Basic Fee Calculator', () => {
  const basicFeeCalculator = new BasicFeeCalculator();
  const mockedFeeCalculationParams = {
    provider: {} as JsonRpcBatchProvider,
    sender: '',
    sourceSygmaId: 1,
    destinationSygmaId: 2,
    resourceSygmaId: '0x0',
    feeHandlerAddress: '',
    feeHandlerType: FeeHandlerType.BASIC,
  } as EvmFeeCalculationParams;

  it('should return calculated fee', async () => {
    const fee = await basicFeeCalculator.calculateFee(mockedFeeCalculationParams);
    expect(fee.fee).toEqual(0n);
  });

  it('should throw error if fee handler type is not BASIC', async () => {
    mockedFeeCalculationParams.feeHandlerType = FeeHandlerType.PERCENTAGE;

    await expect(basicFeeCalculator.calculateFee(mockedFeeCalculationParams)).rejects.toThrow(
      'Fee Calculation method not specified or undefined',
    );
  });
});
