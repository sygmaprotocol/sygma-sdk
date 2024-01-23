import { ethers } from 'ethers';
import { getFeeHandlerAddress } from '../fee/feeHandler.js';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      FeeHandlerRouter__factory: {
        connect: () => {
          return {
            _domainResourceIDToFeeHandlerAddress: jest.fn((domanId: string) => {
              if (domanId !== '1') {
                return Promise.reject(new Error('Error'));
              }
              return Promise.resolve('0x141F8690A87A7E57C2E270ee77Be94935970c035');
            }),
          };
        },
      },
    }) as unknown,
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
    expect(feeHandlerAddress).toEqual('0x141F8690A87A7E57C2E270ee77Be94935970c035');
  });

  it('Should return an error', async () => {
    const someAddress = '0x1234567890123456789012345678901234567890';
    const signerOrProvider: ethers.providers.JsonRpcProvider =
      new ethers.providers.JsonRpcProvider();
    try {
      await getFeeHandlerAddress(signerOrProvider, someAddress, '0', '0x000000');
    } catch (e) {
      expect((e as Error).message).toEqual('Error');
    }
  });
});
