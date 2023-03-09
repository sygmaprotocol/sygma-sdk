import { BigNumber, ethers } from 'ethers';
import fetch from 'node-fetch';
import { requestFeeFromFeeOracle, createOracleFeeData, calculateFeeData } from '../feeOracle';

jest.mock('node-fetch');
const { Response } = jest.requireActual<typeof import('node-fetch')>('node-fetch');

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      DynamicERC20FeeHandlerEVM__factory: {
        connect: () => {
          return {
            calculateFee: jest.fn(() =>
              Promise.resolve({
                fee: BigNumber.from('10'),
                tokenAddress: '0x141F8690A87A7E57C2E270ee77Be94935970c035',
              }),
            ),
          };
        },
      },
    } as unknown),
);

const oracleResponse = {
  response: {
    baseEffectiveRate: '0.000445',
    tokenEffectiveRate: '15.948864',
    dstGasPrice: '2000000000',
    signature:
      'ffdd02c9aaf691e70dcbb69f9e6ec558c3e078c1ec75a5beec0ec46d452c505d3a616a5d6dc738da57ce1ffb6c16fb7f51cfbea6017fa029cd95005a8eaefef31b',
    fromDomainID: 1,
    toDomainID: 2,
    resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
    msgGasLimit: '0',
    dataTimestamp: 1673296900,
    signatureTimestamp: 1673296900,
    expirationTimestamp: 1773300500,
  },
};

describe('feeOracle', () => {
  describe('requestFeeFromFeeOracle', () => {
    it('gets oracle data by http GET', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(JSON.stringify(oracleResponse), { url: 'url', status: 200, statusText: 'OK' }),
      );
      const expectedKeys = Object.keys(oracleResponse.response);

      const resp = await requestFeeFromFeeOracle({
        feeOracleBaseUrl: 'http://localhost:8091',
        fromDomainID: 1,
        toDomainID: 2,
        resourceID: '0x0000000000000000000000000000000000000000000000000000000000000300',
      });
      expect(Object.keys(resp as Object)).toEqual(expectedKeys);
    });

    it('return undefined if server error', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(JSON.stringify(oracleResponse), {
          url: 'url',
          status: 500,
          statusText: 'Internal Error',
        }),
      );
      await expect(
        requestFeeFromFeeOracle({
          feeOracleBaseUrl: 'http://localhost:8091',
          fromDomainID: 1,
          toDomainID: 2,
          resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
        }),
      ).rejects.toThrowError('Internal Error');
    });

    it('return error message from fee oracle server', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(JSON.stringify({ error: 'sick' }), {
          url: 'url',
          status: 200,
          statusText: 'OK',
        }),
      );
      await expect(
        requestFeeFromFeeOracle({
          feeOracleBaseUrl: 'http://localhost:8091',
          fromDomainID: 1,
          toDomainID: 2,
          resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
        }),
      ).rejects.toThrowError('sick');
    });
  });

  describe('createOracleFeeData', () => {
    it('builds feeData', () => {
      const feeData = createOracleFeeData(oracleResponse.response, '10');
      expect(feeData).toBe(
        '0x000000000000000000000000000000000000000000000000000194b9a2ecd000000000000000000000000000000000000000000000000000dd55bf4eab04000000000000000000000000000000000000000000000000000000000000773594000000000000000000000000000000000000000000000000000000000069b26b140000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000ffdd02c9aaf691e70dcbb69f9e6ec558c3e078c1ec75a5beec0ec46d452c505d3a616a5d6dc738da57ce1ffb6c16fb7f51cfbea6017fa029cd95005a8eaefef31b000000000000000000000000000000000000000000000000000000000000000a',
      );
    });
  });

  describe('calculateFeeData', () => {
    it('get the fee data with no oracle private key', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(JSON.stringify(oracleResponse), { url: 'url', status: 200, statusText: 'OK' }),
      );

      const provider = new ethers.providers.JsonRpcProvider();
      const feeData = await calculateFeeData({
        provider,
        sender: ethers.constants.AddressZero,
        recipientAddress: '0x74d2946319bEEe4A140068eb83F9ee3a90B06F4f',
        fromDomainID: 1,
        toDomainID: 2,
        resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
        tokenAmount: '100',
        feeOracleBaseUrl: 'http://localhost:8091',
        feeOracleHandlerAddress: '0xa9ddD97e1762920679f3C20ec779D79a81903c0B',
      });
      expect(feeData?.feeData).toContain(oracleResponse.response.signature);
      expect(feeData).toMatchObject({
        calculatedRate: '0.00000000000000001',
        erc20TokenAddress: '0x141F8690A87A7E57C2E270ee77Be94935970c035',
        feeData:
          '0x000000000000000000000000000000000000000000000000000194b9a2ecd000000000000000000000000000000000000000000000000000dd55bf4eab04000000000000000000000000000000000000000000000000000000000000773594000000000000000000000000000000000000000000000000000000000069b26b140000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000ffdd02c9aaf691e70dcbb69f9e6ec558c3e078c1ec75a5beec0ec46d452c505d3a616a5d6dc738da57ce1ffb6c16fb7f51cfbea6017fa029cd95005a8eaefef31b0000000000000000000000000000000000000000000000000000000000000064',
      });
    });

    it('get error', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue('Err');
      try {
        const provider = new ethers.providers.JsonRpcProvider();
        await calculateFeeData({
          provider,
          sender: ethers.constants.AddressZero,
          recipientAddress: '0x74d2946319bEEe4A140068eb83F9ee3a90B06F4f',
          fromDomainID: 1,
          toDomainID: 2,
          resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
          tokenAmount: '100',
          feeOracleBaseUrl: 'http://localhost:8091',
          feeOracleHandlerAddress: '0xa9ddD97e1762920679f3C20ec779D79a81903c0B',
        });
      } catch (e) {
        expect(e).toMatch('Err');
      }
    });
  });
});
