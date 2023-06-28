import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { FeeHandlerType, Environment } from '../../../src/types';
import { testingConfigData } from '../../constants';
import { ConfigUrl } from '../../../src/constants';
import { SubstrateAssetTransfer } from '../../../src/chains/Substrate';
import * as Substrate from '../../../src/chains/Substrate';

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
    it('Should return a valid Transfer object', () => {
      const expectedVal = {
        to: {
          name: 'Sepolia',
          chainId: 11155111,
          id: 3,
        },
        from: {
          name: 'rococo-phala',
          chainId: 400,
          id: 5,
        },
        resource: {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001000',
          address: '',
          type: 'fungible',
          symbol: 'PHA',
          decimals: 18,
        },
        sender: '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        amount: {
          amount: '200',
        },
      };

      const actualVal = assetTransfer.createFungibleTransfer(
        '5FNHV5TZAQ1AofSPbP7agn5UesXSYDX9JycUSCJpNuwgoYTS',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000001000',
        '200',
      );

      expect(actualVal).toStrictEqual(expectedVal);
    });
  });

  describe('getFee', () => {
    it('Should successfully get basic fee', async function () {
      const transfer = assetTransfer.createFungibleTransfer(
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
  });

  describe('buildTransferTransaction', () => {
    it('Should build fungible transfer tx if resource type FUNGIBLE', function () {
      const transfer = assetTransfer.createFungibleTransfer(
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

    it('Should throw an error if the fee is greater than the amount being transferred', () => {
      const transfer = assetTransfer.createFungibleTransfer(
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

      expect(() => assetTransfer.buildTransferTransaction(transfer, fee)).toThrow();
    });
  });
});
