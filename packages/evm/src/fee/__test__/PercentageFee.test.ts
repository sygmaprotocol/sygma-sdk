/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { FeeHandlerType } from '@buildwithsygma/core';
import type { JsonRpcBatchProvider } from '@ethersproject/providers';
import type { EvmFeeCalculationParams } from '../types.js';
import { PercentageFeeCalculator } from '../PercentageFee.js';

jest.mock('@buildwithsygma/sygma-contracts', () => {
  const { constants, BigNumber } = jest.requireActual('ethers');

  return {
    ...jest.requireActual('@buildwithsygma/sygma-contracts'),
    PercentageERC20FeeHandlerEVM__factory: {
      connect: jest.fn().mockReturnValue({
        calculateFee: () => Promise.resolve([constants.Zero]),
        _resourceIDToFeeBounds: jest.fn().mockResolvedValue({
          lowerBound: BigNumber.from('0'),
          upperBound: BigNumber.from('10000'),
        }),
        _domainResourceIDToFee: jest.fn().mockResolvedValue(BigNumber.from('100000')),
        HUNDRED_PERCENT: jest.fn().mockResolvedValue(BigNumber.from(10000)),
      }),
    },
  } as unknown;
});

describe('Percentage Fee Calculator', () => {
  const percentageFeeCalculator = new PercentageFeeCalculator();
  const mockedFeeCalculationParams = {
    provider: {} as JsonRpcBatchProvider,
    sender: '',
    sourceSygmaId: 1,
    destinationSygmaId: 2,
    resourceSygmaId: '0x0',
    feeHandlerAddress: '',
    feeHandlerType: FeeHandlerType.PERCENTAGE,
  } as EvmFeeCalculationParams;

  it('should calculate percentage fee', async () => {
    const fee = await percentageFeeCalculator.calculateFee(mockedFeeCalculationParams);
    expect(fee.fee).toEqual(0n);
  });
});
