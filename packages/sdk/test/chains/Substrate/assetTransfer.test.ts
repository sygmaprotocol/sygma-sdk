import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import type { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import type { Transfer, Fungible } from '../../../src/types/index.js';
import { FeeHandlerType, Environment, ResourceType, Network } from '../../../src/types/index.js';
import { testingConfigData } from '../../constants.js';
import { ConfigUrl } from '../../../src/constants.js';
import { SubstrateAssetTransfer } from '../../../src/chains/Substrate/index.js';
import * as Substrate from '../../../src/chains/Substrate/index.js';

const axiosMock = new MockAdapter(axios);

const mockApiPromise = {
  consts: {
    sygmaBridge: {
      eip712ChainID: new BN(400),
    },
  },
  query: {
    sygmaBasicFeeHandler: {
      assetFees: jest.fn(),
    },
    sygmaFeeHandlerRouter: {
      handlerType: jest.fn(),
    },
    sygmaPercentageFeeHandler: {
      assetFeeRate: jest.fn(),
    },
  },
  registry: {
    chainDecimals: [new BN(10)],
  },
  tx: {
    sygmaBridge: {
      deposit: jest.fn().mockResolvedValue({ a: 'b' }),
    },
  },
} as unknown as Partial<ApiPromise>;

const calculateBasicFeeMock = jest.spyOn(Substrate, 'getBasicFee').mockResolvedValue({
  fee: new BN('100'),
  type: FeeHandlerType.BASIC,
});

const calculatePercentageFeeMock = jest.spyOn(Substrate, 'getPercentageFee').mockResolvedValue({
  fee: new BN(100),
  type: FeeHandlerType.PERCENTAGE,
});

describe('Substrate asset transfer', () => {
  let assetTransfer: SubstrateAssetTransfer;

  beforeEach(async () => {
    axiosMock.onGet(ConfigUrl.DEVNET).reply(200, testingConfigData);
    assetTransfer = new SubstrateAssetTransfer();
    await assetTransfer.init(mockApiPromise as ApiPromise, Environment.DEVNET);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFungibleTransfer', () => {
    it('Should return a valid Transfer object', async () => {
      const expectedVal: Transfer<Fungible> = {
        to: {
          name: 'Sepolia',
          chainId: 11155111,
          id: 3,
          type: Network.EVM,
        },
        from: {
          name: 'rococo-phala',
          chainId: 400,
          id: 5,
          type: Network.SUBSTRATE,
        },
        resource: {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001000',
          address: '',
          type: ResourceType.FUNGIBLE,
          symbol: 'PHA',
          decimals: 18,
        },
        sender: '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        details: {
          recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
          amount: '200',
          parachainId: 1001,
        },
      };

      const actualVal = await assetTransfer.createFungibleTransfer(
        '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000001000',
        '200',
        1001,
      );

      expect(actualVal).toStrictEqual(expectedVal);
    });

    it('should fetch the destination handler liquidity when a rpc url is provided', async () => {
      const mockFetchDestinationHandlerBalance = jest
        .spyOn(assetTransfer, 'fetchDestinationHandlerBalance')
        .mockReturnValueOnce(Promise.resolve(BigInt(400)));

      const expectedVal: Transfer<Fungible> = {
        to: {
          name: 'Sepolia',
          chainId: 11155111,
          id: 3,
          type: Network.EVM,
        },
        from: {
          name: 'rococo-phala',
          chainId: 400,
          id: 5,
          type: Network.SUBSTRATE,
        },
        resource: {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001000',
          address: '',
          type: ResourceType.FUNGIBLE,
          symbol: 'PHA',
          decimals: 18,
        },
        sender: '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        details: {
          recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
          amount: '200',
          parachainId: 1001,
        },
      };

      const actualVal = await assetTransfer.createFungibleTransfer(
        '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000001000',
        '200',
        1001,
        'http://destination.chain.rpc',
      );

      expect(actualVal).toStrictEqual(expectedVal);
      expect(mockFetchDestinationHandlerBalance).toHaveBeenCalled();
    });

    it('should throw a LiquidityError if destination chain liquidity is too low', async () => {
      const mockFetchDestinationHandlerBalance = jest
        .spyOn(assetTransfer, 'fetchDestinationHandlerBalance')
        .mockReturnValueOnce(Promise.resolve(BigInt(100)));

      await expect(
        async () =>
          await assetTransfer.createFungibleTransfer(
            '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
            11155111,
            '0x557abEc0cb31Aa925577441d54C090987c2ED818',
            '0x0000000000000000000000000000000000000000000000000000000000001000',
            '200',
            undefined,
            'http://destination.chain.rpc',
          ),
      ).rejects.toThrowError(
        'Destination chain liquidity is too low to perform this transfer. Transfer is limited to 100',
      );
      expect(mockFetchDestinationHandlerBalance).toHaveBeenCalled();
    });
  });

  describe('getFee', () => {
    it('Should successfully get basic fee', async function () {
      jest.spyOn(Substrate, 'getFeeHandler').mockResolvedValueOnce(FeeHandlerType.BASIC);

      const transfer = await assetTransfer.createFungibleTransfer(
        '0x3690601896C289be2d894c3d1213405310D0a25C',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000001000',
        '200',
      );

      const fee = await assetTransfer.getFee(transfer);

      expect(fee).toEqual({
        fee: new BN(100),
        type: FeeHandlerType.BASIC,
      });

      expect(calculateBasicFeeMock).toBeCalled();
    });
    it('Should successfully get Percentage fee', async function () {
      jest.spyOn(Substrate, 'getFeeHandler').mockResolvedValueOnce(FeeHandlerType.PERCENTAGE);

      const transfer = await assetTransfer.createFungibleTransfer(
        '0x3690601896C289be2d894c3d1213405310D0a25C',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000001000',
        '200',
      );

      const fee = await assetTransfer.getFee(transfer);

      expect(fee).toEqual({
        fee: new BN(100),
        type: FeeHandlerType.PERCENTAGE,
      });

      expect(calculatePercentageFeeMock).toBeCalled();
    });
  });

  describe('buildTransferTransaction', () => {
    it('Should build fungible transfer tx if resource type FUNGIBLE', async () => {
      const transfer = await assetTransfer.createFungibleTransfer(
        '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000001000',
        '200',
      );

      const fee = {
        fee: new BN('100'),
        type: FeeHandlerType.BASIC,
      };
      const tx = assetTransfer.buildTransferTransaction(transfer, fee);

      expect(tx).toBeDefined();
    });

    it('Should throw an error if the fee is greater than the amount being transferred', async () => {
      const transfer = await assetTransfer.createFungibleTransfer(
        '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000001000',
        '200',
      );

      const fee = {
        fee: new BN('500'),
        type: FeeHandlerType.BASIC,
      };

      expect(() => assetTransfer.buildTransferTransaction(transfer, fee)).toThrowError(
        'Transfer amount should be higher than transfer fee',
      );
    });
  });

  describe('getRegisteredResourcesTo', () => {
    it('should throw error if source domain provided', async () => {
      try {
        await assetTransfer.getRegisteredResourcesTo('5');
      } catch (e) {
        expect(e).toEqual(new Error('Provided destination domain same as source domain'));
      }
    });

    it('should return registered resources', async () => {
      jest.spyOn(Substrate, 'getFeeHandler').mockResolvedValue(FeeHandlerType.BASIC);
      const r = await assetTransfer.getRegisteredResourcesTo('0');
      expect(r.length).toEqual(2);
    });

    it('should return only one registered resource', async () => {
      jest
        .spyOn(Substrate, 'getFeeHandler')
        .mockResolvedValueOnce(FeeHandlerType.BASIC)
        .mockResolvedValue(FeeHandlerType.UNDEFINED);
      const r = await assetTransfer.getRegisteredResourcesTo('0');
      expect(r.length).toEqual(1);
    });

    it('should return no resources', async () => {
      jest.spyOn(Substrate, 'getFeeHandler').mockResolvedValue(FeeHandlerType.UNDEFINED);
      const r = await assetTransfer.getRegisteredResourcesTo('0');
      expect(r.length).toEqual(0);
    });
  });
});
