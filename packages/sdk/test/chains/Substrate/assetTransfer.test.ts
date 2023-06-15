import axios from 'axios';
import { BigNumber, providers } from 'ethers';
import MockAdapter from 'axios-mock-adapter';

import { ApiPromise } from '@polkadot/api';
import { FeeHandlerType, Environment } from '../../../src/types';
import { testingConfigData } from '../../constants';
import { ConfigUrl } from '../../../src/constants';
import { SubstrateAssetTransfer } from '../../../src/chains/Substrate';
import * as Substrate from '../../../src/chains/Substrate';

const feeHandlerAddressFunction = jest.fn();

const axiosMock = new MockAdapter(axios);
const mockProvider: Partial<providers.Provider> = {
  getFeeData: jest.fn().mockResolvedValue({ gasPrice: BigNumber.from(100) }),
  getNetwork: jest.fn().mockResolvedValue({
    chainId: 11155111,
  }),
};

const mockApiPromise = {
  api: {
    consts: {
      sygmaBridge: {
        eip712ChainID: 5,
      },
    },
    query: {
      sygmaBasicFeeHandler: {
        assetFees: jest.fn(),
      },
    },
  },
} as Partial<ApiPromise>;

const calculateBasicFeeMock = jest.spyOn(Substrate, 'getBasicFee').mockResolvedValue({
  fee: BigNumber.from('100'),
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
          name: 'Mumbai',
          chainId: 80001,
          id: 2,
        },
        resource: {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          address: '0x3690601896C289be2d894c3d1213405310D0a25C',
          type: 'fungible',
          symbol: 'LR',
          decimals: 18,
        },
        sender: '0x3690601896C289be2d894c3d1213405310D0a25C',
        recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        amount: {
          amount: '200',
        },
      };

      const actualVal = assetTransfer.createFungibleTransfer(
        '0x3690601896C289be2d894c3d1213405310D0a25C',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000000300',
        200,
      );

      expect(actualVal).toStrictEqual(expectedVal);
    });
  });

  describe('getFee', () => {
    it('Should successfully get basic fee', async function () {
      feeHandlerAddressFunction.mockResolvedValue('0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622');

      const transfer = assetTransfer.createFungibleTransfer(
        '0x3690601896C289be2d894c3d1213405310D0a25C',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000000300',
        200,
      );

      const fee = await assetTransfer.getFee(transfer);

      expect(fee).toEqual({
        fee: BigNumber.from('100'),
        type: FeeHandlerType.BASIC,
        handlerAddress: '0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622',
      });
      expect(calculateBasicFeeMock).toBeCalled();
      expect(calculateBasicFeeMock).toBeCalledWith({
        basicFeeHandlerAddress: '0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622',
        toDomainID: transfer.to.id,
        fromDomainID: transfer.from.id,
        provider: mockProvider,
        resourceID: transfer.resource.resourceId,
        sender: transfer.sender,
      });
    });

    it('Should throw error for unsupported fee handler', async function () {
      feeHandlerAddressFunction.mockResolvedValue('0xunsupported');

      const transfer = assetTransfer.createFungibleTransfer(
        '0x3690601896C289be2d894c3d1213405310D0a25C',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000000300',
        200,
      );

      try {
        await assetTransfer.getFee(transfer);
        fail('error not thrown');
      } catch (e) {
        expect(e).toEqual(new Error('Unsupported fee handler type'));
      }
    });
  });

  describe('buildTransferTransaction', () => {
    it('Should build fungible transfer tx if resource type FUNGIBLE', function () {
      const transfer = assetTransfer.createFungibleTransfer(
        '0x3690601896C289be2d894c3d1213405310D0a25C',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000000300',
        200,
      );

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.BASIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const tx = assetTransfer.buildTransferTransaction(transfer, fee);

      expect(tx).toBeDefined();
    });
  });

  describe('buildTransferTransaction', () => {
    it('Should build erc20 transfer tx if resource type FUNGIBLE', function () {
      const transfer = assetTransfer.createFungibleTransfer(
        '0x3690601896C289be2d894c3d1213405310D0a25C',
        11155111,
        '0x557abEc0cb31Aa925577441d54C090987c2ED818',
        '0x0000000000000000000000000000000000000000000000000000000000000300',
        200,
      );

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.BASIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const tx = assetTransfer.buildTransferTransaction(transfer, fee);

      expect(tx).toBeDefined();
    });
  });
});
