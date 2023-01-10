/* eslint-disable */

import { BigNumber, ethers } from 'ethers';
import fetch from 'node-fetch';
import { requestFeeFromFeeOracle, createOracleFeeData, calculateFeeData } from '../feeOracle';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

jest.mock('@buildwithsygma/sygma-contracts', () => ({
  ...jest.requireActual('@buildwithsygma/sygma-contracts'),
  FeeHandlerWithOracle__factory: {
    connect: (args: any) => {
      return {
        calculateFee: jest.fn(async () => ({
          fee: BigNumber.from('10'),
          tokenAddress: '0x141F8690A87A7E57C2E270ee77Be94935970c035',
        })),
      };
    },
  },
}));

const oracleResponse = {
  response: {
    baseEffectiveRate: "0.000445",
    tokenEffectiveRate: "15.948864",
    dstGasPrice: "2000000000",
    signature: "ffdd02c9aaf691e70dcbb69f9e6ec558c3e078c1ec75a5beec0ec46d452c505d3a616a5d6dc738da57ce1ffb6c16fb7f51cfbea6017fa029cd95005a8eaefef31b",
    fromDomainID: 1,
    toDomainID: 2,
    resourceID: "0x0000000000000000000000000000000000000000000000000000000000000303",
    msgGasLimit: "56",
    dataTimestamp: 1673296900,
    signatureTimestamp: 1673296900,
    expirationTimestamp: 1773300500,
  }
}

describe('feeOracle', () => {
  describe('requestFeeFromFeeOracle', () => {
    it('gets oracle data by http GET', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(JSON.stringify(oracleResponse), { url: 'url', status: 200, statusText: 'OK' }),
      );
      const expectedKeys = Object.keys(oracleResponse.response)

      const resp = await requestFeeFromFeeOracle({
        feeOracleBaseUrl: 'http://localhost:8091',
        fromDomainID: 1,
        toDomainID: 2,
        resourceID: '0x0000000000000000000000000000000000000000000000000000000000000300',
      });
      expect(Object.keys(resp!)).toEqual(expectedKeys)
    });

      it('return undefined if server error', async () => {
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
          new Response(JSON.stringify(oracleResponse), {
            url: 'url',
            status: 500,
            statusText: 'Internal Error',
          }),
        );
        try {
          await requestFeeFromFeeOracle({
            feeOracleBaseUrl: 'http://localhost:8091',
            fromDomainID: 1,
            toDomainID: 2,
            resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
          });
        } catch (e) {
          // @ts-ignore
          expect(e.message).toMatch('Invalid fee oracle response');
        }
      });
    });

    describe('createOracleFeeData', () => {
      it('builds feeData', () => {
        const feeData = createOracleFeeData(
          oracleResponse.response,
          10,
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e',
        );
        expect(feeData).toBe(
          '0x0000000000000000000000000000000000000000000000000001656e7165900000000000000000000000000000000000000000000000000076d6981ee7faf00000000000000000000000000000000000000000000000000000000007badfcc00000000000000000000000000000000000000000000000000000000006272f4cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001bd8e74f3168db3a616cfb793d8223d3065911eafe0f6b29aa422265f27757ed2572b18962de97a5487097ef5c4b8be0f0c0f978dd196b05a542d3dc6a47213681b000000000000000000000000000000000000000000000000000000000000000a',
        );
      });
    });

    describe('calculateFeeData', () => {
      it('get the fee data', async () => {
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
          tokenAmount: 100,
          feeOracleBaseUrl: 'http://localhost:8091',
          feeOracleHandlerAddress: '0xa9ddD97e1762920679f3C20ec779D79a81903c0B',
          overridedResourceId: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
          oraclePrivateKey: '0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e',
        });
        expect(feeData).toMatchObject({
          calculatedRate: '0.00000000000000001',
          erc20TokenAddress: '0x141F8690A87A7E57C2E270ee77Be94935970c035',
          feeData:
            '0x0000000000000000000000000000000000000000000000000001656e7165900000000000000000000000000000000000000000000000000076d6981ee7faf00000000000000000000000000000000000000000000000000000000007badfcc00000000000000000000000000000000000000000000000000000000006272f4cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001bd8e74f3168db3a616cfb793d8223d3065911eafe0f6b29aa422265f27757ed2572b18962de97a5487097ef5c4b8be0f0c0f978dd196b05a542d3dc6a47213681b0000000000000000000000000000000000000000000000000000000000000064',
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
            tokenAmount: 100,
            feeOracleBaseUrl: 'http://localhost:8091',
            feeOracleHandlerAddress: '0xa9ddD97e1762920679f3C20ec779D79a81903c0B',
            overridedResourceId: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
            oraclePrivateKey: '0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e',
          });
        } catch (e) {
          expect(e).toMatch('Err');
        }
      });
  });
});
