import { ethers } from 'ethers';
import { getFeeHandlerAddress } from '../feeHandler';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      FeeHandlerRouter__factory: {
        connect: () => {
          return {
            _domainResourceIDToFeeHandlerAddress: jest.fn(() =>
              Promise.resolve('0x141F8690A87A7E57C2E270ee77Be94935970c035'),
            ),
          };
        },
      },
    } as unknown),
);

describe('feeHandler', () => {
  it('should return the correct fee handler address', async () => {
    const someAddress = '0x1234567890123456789012345678901234567890';
    const signerOrProvider: ethers.providers.JsonRpcProvider =
      new ethers.providers.JsonRpcProvider();

    const feeHandlerAddress = await getFeeHandlerAddress(
      signerOrProvider,
      someAddress,
      '1',
      '0x000000',
    );
    expect(feeHandlerAddress).toEqual('0x141F8690A87A7E57C2E270ee77Be94935970c035')
  });
});
