import { utils, BigNumber, ethers } from 'ethers';
import { requestFeeFromFeeOracle, createOracleFeeData, calculateFeeData } from '../feeOracle';
import fetch from 'node-fetch';
import {FeeHandlerWithOracle__factory} from '@chainsafe/chainbridge-contracts';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

jest.mock('@chainsafe/chainbridge-contracts', () => ({
  ...jest.requireActual('@chainsafe/chainbridge-contracts'),
  FeeHandlerWithOracle__factory: {
    connect: (args: any)=> {
      return {
        calculateFee: jest.fn(async () =>({
          fee: BigNumber.from("10"),
          tokenAddress: "0x141F8690A87A7E57C2E270ee77Be94935970c035"
        }))
      }
    }
  }
}))

const oracleResponse = {
  response: {
    baseEffectiveRate: '0.000393',
    tokenEffectiveRate: '8.563199',
    dstGasPrice: '33200000000',
    signature:
      '42d45f334d7e43ed2e69f2344599c0a9d358964a712dd9f5cc9e5c51eeedf96916ff33b1b1bff1f81e02d1b325698b4342b19b5637deea679c8c6a607d0c25d21c',
    fromDomainID: 1,
    toDomainID: 2,
    resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
    dataTimestamp: 1651697340,
    signatureTimestamp: 1651697363,
    expirationTimestamp: 1651700940,
  },
};

describe('feeOracle', () => {
  describe('requestFeeFromFeeOracle', () => {
    it('gets oracle data by http GET', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        new Response(JSON.stringify(oracleResponse), { url: 'url', status: 200, statusText: 'OK' }),
      );

      const resp = await requestFeeFromFeeOracle({
        feeOracleBaseUrl: 'http://localhost:8091',
        fromDomainID: 1,
        toDomainID: 2,
        resourceID: '0x0000000000000000000000000000000000000000000000000000000000000001',
      });
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
        const resp = await requestFeeFromFeeOracle({
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
    it("builds feeData", () => {
      const feeData = createOracleFeeData(oracleResponse.response, 10, "0x0000000000000000000000000000000000000000000000000000000000000001", '0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e')
      expect(feeData).toBe(
        '0x0000000000000000000000000000000000000000000000000001656e7165900000000000000000000000000000000000000000000000000076d6981ee7faf00000000000000000000000000000000000000000000000000000000007badfcc00000000000000000000000000000000000000000000000000000000006272f4cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001bd8e74f3168db3a616cfb793d8223d3065911eafe0f6b29aa422265f27757ed2572b18962de97a5487097ef5c4b8be0f0c0f978dd196b05a542d3dc6a47213681b000000000000000000000000000000000000000000000000000000000000000a',
      );
    })
  })

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
        oraclePrivateKey: '0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e'
      });
      console.log("🚀 ~ file: feeOracle.test.ts ~ line 99 ~ it ~ feeData", feeData)
      expect(feeData).toMatchObject({
        calculatedRate: '0.00000000000000001',
        erc20TokenAddress: '0x141F8690A87A7E57C2E270ee77Be94935970c035',
        feeData: '0x0000000000000000000000000000000000000000000000000001656e7165900000000000000000000000000000000000000000000000000076d6981ee7faf00000000000000000000000000000000000000000000000000000000007badfcc00000000000000000000000000000000000000000000000000000000006272f4cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001bd8e74f3168db3a616cfb793d8223d3065911eafe0f6b29aa422265f27757ed2572b18962de97a5487097ef5c4b8be0f0c0f978dd196b05a542d3dc6a47213681b0000000000000000000000000000000000000000000000000000000000000064'
      });
    });

    it('get error', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue("Err")
      try {

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
          oraclePrivateKey: '0x6937d1d0b52f2fa7f4e071c7e64934ad988a8f21c6bf4f323fc19af4c77e3c5e'
        });
      } catch (e) {
        expect(e).toMatch("Err");
      }
    });
  });

});
