import axios from 'axios';
import { BigNumber, providers } from 'ethers';
import MockAdapter from 'axios-mock-adapter';

import {
  Transfer,
  ResourceType,
  FeeHandlerType,
  Environment,
  NonFungible,
  Fungible,
} from '../../../src/types';
import { testingConfigData } from '../../constants';
import { ConfigUrl } from '../../../src/constants';
import { EVMAssetTransfer } from '../../../src/chains/EVM';
import * as EVM from '../../../src/chains/EVM';
import { DEVNET_FEE_ORACLE_BASE_URL } from '../../../src/utils';

const feeHandlerAddressFunction = jest.fn();
const resourceHandlerFunction = jest.fn();
jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
  ({
    ...jest.requireActual('@buildwithsygma/sygma-contracts'),
    FeeHandlerRouter__factory: {
      connect: () => {
        return {
          _domainResourceIDToFeeHandlerAddress: feeHandlerAddressFunction,
        };
      },
    },
    ERC20__factory: {
      connect: () => {
        return {};
      },
    },
    ERC721MinterBurnerPauser__factory: {
      connect: () => {
        return {};
      },
    },
    Bridge__factory: {
      connect: () => {
        return {
          _resourceIDToHandlerAddress: resourceHandlerFunction,
        };
      },
    },
  } as unknown),
);
const axiosMock = new MockAdapter(axios);
const mockProvider: Partial<providers.Provider> = {
  getFeeData: jest.fn().mockResolvedValue({ gasPrice: BigNumber.from(100) }),
  getNetwork: jest.fn().mockResolvedValue({
    chainId: 11155111,
  }),
};
const calculateBasicFeeMock = jest.spyOn(EVM, 'calculateBasicfee').mockResolvedValue({
  fee: BigNumber.from('100'),
  type: FeeHandlerType.BASIC,
  handlerAddress: '0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622',
});
const calculateDynamicFeeMock = jest.spyOn(EVM, 'calculateDynamicFee').mockResolvedValue({
  fee: BigNumber.from('100'),
  type: FeeHandlerType.DYNAMIC,
  handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
});
const isApprovedMock = jest.spyOn(EVM, 'isApproved');
const getAllowanceMock = jest.spyOn(EVM, 'getERC20Allowance');
const approveMock = jest.spyOn(EVM, 'approve');
const erc20TransferMock = jest.spyOn(EVM, 'erc20Transfer');
const erc721TransferMock = jest.spyOn(EVM, 'erc721Transfer');

describe('EVM asset transfer', () => {
  let assetTransfer: EVMAssetTransfer;
  const transfer: Transfer<Fungible> = {
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
      type: ResourceType.FUNGIBLE,
      symbol: 'LR',
      decimals: 18,
    },
    sender: '0x3690601896C289be2d894c3d1213405310D0a25C',
    details: {
      recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
      amount: '200',
    },
  };
  const nonFungibleTransfer: Transfer<NonFungible> = {
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
      type: ResourceType.NON_FUNGIBLE,
      symbol: 'LR',
      decimals: 18,
    },
    sender: '0x3690601896C289be2d894c3d1213405310D0a25C',
    details: {
      recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
      tokenId: 'id',
    },
  };

  beforeEach(async () => {
    axiosMock.onGet(ConfigUrl.DEVNET).reply(200, testingConfigData);
    assetTransfer = new EVMAssetTransfer();
    await assetTransfer.init(mockProvider as providers.BaseProvider, Environment.DEVNET);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFee', () => {
    it('Should successfully get basic fee', async function () {
      feeHandlerAddressFunction.mockResolvedValue('0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622');

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

    it('Should successfully get dynamic fee', async function () {
      feeHandlerAddressFunction.mockResolvedValue('0xe495c86962DcA7208ECcF2020A273395AcE8da3e');

      const fee = await assetTransfer.getFee(transfer);

      expect(fee).toEqual({
        fee: BigNumber.from('100'),
        type: FeeHandlerType.DYNAMIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      });
      expect(calculateDynamicFeeMock).toBeCalled();
      expect(calculateDynamicFeeMock).toBeCalledWith({
        feeHandlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
        feeOracleBaseUrl: DEVNET_FEE_ORACLE_BASE_URL,
        toDomainID: transfer.to.id,
        fromDomainID: transfer.from.id,
        provider: mockProvider,
        resourceID: transfer.resource.resourceId,
        sender: transfer.sender,
        tokenAmount: '200',
        depositData:
          '0x00000000000000000000000000000000000000000000000000000000000000c80000000000000000000000000000000000000000000000000000000000000014557abec0cb31aa925577441d54c090987c2ed818',
      });
    });

    it('Should throw error for unsupported fee handler', async function () {
      feeHandlerAddressFunction.mockResolvedValue('0xunsupported');

      try {
        await assetTransfer.getFee(transfer);
        fail('error not thrown');
      } catch (e) {
        expect(e).toEqual(new Error('Unsupported fee handler type'));
      }
    });
  });

  describe('buildApprovals', function () {
    it('Should return empty array if ERC20 token already approved', async function () {
      resourceHandlerFunction.mockResolvedValue('0x03896BaeA3A8CD98E46C576AF6Ceaffb69a51AFB');
      getAllowanceMock.mockResolvedValue(BigNumber.from('250'));

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.DYNAMIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const approvals = await assetTransfer.buildApprovals(transfer, fee);

      expect(approvals).toEqual([]);
    });

    it('Should return approval tx if ERC20 token not approved and basic fee used', async function () {
      resourceHandlerFunction.mockResolvedValue('0x03896BaeA3A8CD98E46C576AF6Ceaffb69a51AFB');
      getAllowanceMock.mockResolvedValue(BigNumber.from('150'));
      approveMock.mockResolvedValue({});

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.DYNAMIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const approvals = await assetTransfer.buildApprovals(transfer, fee);

      expect(approvals.length).toBe(1);
    });

    it('Should return 2 approval txs if ERC20 token not approved and percentage fee used', async function () {
      resourceHandlerFunction.mockResolvedValue('0x03896BaeA3A8CD98E46C576AF6Ceaffb69a51AFB');
      getAllowanceMock.mockResolvedValue(BigNumber.from('0'));
      approveMock.mockResolvedValue({});

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.PERCENTAGE,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const approvals = await assetTransfer.buildApprovals(transfer, fee);

      expect(approvals.length).toBe(2);
    });

    it('Should return empty array if ERC721 token already approved', async function () {
      resourceHandlerFunction.mockResolvedValue('0x03896BaeA3A8CD98E46C576AF6Ceaffb69a51AFB');
      isApprovedMock.mockResolvedValue(true);

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.BASIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const approvals = await assetTransfer.buildApprovals(nonFungibleTransfer, fee);

      expect(approvals.length).toBe(0);
    });

    it('Should return approval tx if ERC721 token not approved', async function () {
      resourceHandlerFunction.mockResolvedValue('0x03896BaeA3A8CD98E46C576AF6Ceaffb69a51AFB');
      isApprovedMock.mockResolvedValue(false);

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.BASIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const approvals = await assetTransfer.buildApprovals(nonFungibleTransfer, fee);

      expect(approvals.length).toBe(1);
    });
  });

  describe('buildTransferTransaction', () => {
    it('Should build erc20 transfer tx if resource type FUNGIBLE', async function () {
      erc20TransferMock.mockResolvedValue({});

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.BASIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const tx = await assetTransfer.buildTransferTransaction(transfer, fee);

      expect(tx).toBeDefined();
      expect(erc20TransferMock).toBeCalled();
    });

    it('Should build erc721 transfer tx if resource type NONFUNGIBLE', async function () {
      erc721TransferMock.mockResolvedValue({});

      const fee = {
        fee: BigNumber.from('100'),
        type: FeeHandlerType.BASIC,
        handlerAddress: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
      };
      const tx = await assetTransfer.buildTransferTransaction(nonFungibleTransfer, fee);

      expect(tx).toBeDefined();
      expect(erc721TransferMock).toBeCalled();
    });
  });
});
