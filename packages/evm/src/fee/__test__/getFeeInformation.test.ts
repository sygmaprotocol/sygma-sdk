import type { Config } from '@buildwithsygma/core';
import { FeeHandlerType } from '@buildwithsygma/core';
import type { JsonRpcProvider } from '@ethersproject/providers';
import { getFeeInformation } from '../getFeeInformation.js';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      FeeHandlerRouter__factory: {
        connect: jest.fn().mockReturnValue({
          _domainResourceIDToFeeHandlerAddress: jest
            .fn()
            .mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
        }),
      },
    }) as unknown,
);

describe('getFeeInformation()', () => {
  const feeInfoParams = {
    config: {
      getDomainConfig: jest.fn().mockReturnValue({
        feeRouter: '',
        feeHandlers: [
          {
            address: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
            type: FeeHandlerType.BASIC,
          },
        ],
      }),
    },
    sourceProvider: {},
    sygmaSourceId: 1,
    sygmaDestinationDomainId: 1,
    sygmaResourceId: '0x',
  };

  it('should provide fee handler configuration', async () => {
    const feeInformation = await getFeeInformation(
      feeInfoParams.config as unknown as Config,
      feeInfoParams.sourceProvider as unknown as JsonRpcProvider,
      feeInfoParams.sygmaSourceId,
      feeInfoParams.sygmaDestinationDomainId,
      feeInfoParams.sygmaResourceId,
    );

    expect(feeInformation.feeHandlerType).toEqual(FeeHandlerType.BASIC);
  });
});
