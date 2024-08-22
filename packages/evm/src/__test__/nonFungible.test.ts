import type { Eip1193Provider } from '@buildwithsygma/core';
import { Config, FeeHandlerType, Network, ResourceType } from '@buildwithsygma/core';
import {
  BasicFeeHandler__factory,
  Bridge__factory,
  ERC721MinterBurnerPauser__factory,
  FeeHandlerRouter__factory,
} from '@buildwithsygma/sygma-contracts';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils.js';

import { createNonFungibleAssetTransfer } from '../nonFungibleAssetTransfer.js';
import type { NonFungibleTransferParams } from '../types.js';

const TRANSFER_PARAMS: NonFungibleTransferParams = {
  source: 1,
  destination: 2,
  sourceAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
  sourceNetworkProvider: jest.fn() as unknown as Eip1193Provider,
  resource: {
    address: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
    type: ResourceType.NON_FUNGIBLE,
    resourceId: '0x0',
    caip19: '0x11',
  },
  tokenId: parseEther('10').toString(),
  recipientAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
};

const MOCKED_CONFIG = {
  init: jest.fn(),
  getDomainConfig: jest.fn().mockReturnValue({ bridge: '', id: 1 }),
  getDomain: jest.fn().mockReturnValue({ id: 1, type: Network.EVM }),
  getResources: jest.fn().mockReturnValue([TRANSFER_PARAMS.resource]),
  findDomainConfigBySygmaId: jest.fn().mockReturnValue({ id: 1 }),
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@buildwithsygma/core', () => ({
  ...jest.requireActual('@buildwithsygma/core'),
  Config: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ethersproject/providers', () => ({
  ...jest.requireActual('@ethersproject/providers'),
  Web3Provider: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@buildwithsygma/sygma-contracts', () => ({
  ...jest.requireActual('@buildwithsygma/sygma-contracts'),
  Bridge__factory: { connect: jest.fn() },
  ERC20__factory: { connect: jest.fn() },
  BasicFeeHandler__factory: { connect: jest.fn() },
  PercentageERC20FeeHandler__factory: { connect: jest.fn() },
  FeeHandlerRouter__factory: { connect: jest.fn() },
  ERC721MinterBurnerPauser__factory: { connect: jest.fn() },
}));

describe('NonFungible - createNonFungibleAssetTransfer', () => {
  beforeAll(() => {
    (Config as jest.Mock).mockReturnValue(MOCKED_CONFIG);

    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('basic'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
    });

    (FeeHandlerRouter__factory.connect as jest.Mock).mockReturnValue({
      _domainResourceIDToFeeHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
    });

    (Bridge__factory.connect as jest.Mock).mockReturnValue({
      _resourceIDToHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
      _feeHandler: jest.fn().mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
    });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a transfer', async () => {
    const transfer = await createNonFungibleAssetTransfer(TRANSFER_PARAMS);
    expect(transfer).toBeTruthy();
    expect(transfer.transferTokenId).toEqual(parseEther('10').toString());
  });

  it('should create fail if handler is not registered', async () => {
    (Bridge__factory.connect as jest.Mock).mockReturnValue({
      _resourceIDToHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x0000000000000000000000000000000000000000'),
    });

    await expect(async () => await createNonFungibleAssetTransfer(TRANSFER_PARAMS)).rejects.toThrow(
      'Handler not registered, please check if this is a valid bridge route.',
    );
  });
});

describe('NonFungibleAssetTransfer', () => {
  beforeAll(() => {
    (Config as jest.Mock).mockReturnValue(MOCKED_CONFIG);

    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('basic'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
    });

    (FeeHandlerRouter__factory.connect as jest.Mock).mockReturnValue({
      _domainResourceIDToFeeHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
    });

    (Bridge__factory.connect as jest.Mock).mockReturnValue({
      _resourceIDToHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
      _feeHandler: jest.fn().mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
    });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return basic fee for non fungible transfer', async () => {
    const transfer = await createNonFungibleAssetTransfer(TRANSFER_PARAMS);
    const fee = await transfer.getFee();
    expect(fee).toBeTruthy();
    expect(fee.type).toEqual(FeeHandlerType.BASIC);
  });

  it('setter - setTokenId', async () => {
    const transfer = await createNonFungibleAssetTransfer(TRANSFER_PARAMS);
    const newTokenId = '2046189';
    transfer.setTokenId(newTokenId);
    const transferTokenId = transfer.transferTokenId;
    expect(transferTokenId).toEqual(newTokenId);
  });

  it('approval - returns approval transaction if not approved', async () => {
    const transfer = await createNonFungibleAssetTransfer(TRANSFER_PARAMS);

    (ERC721MinterBurnerPauser__factory.connect as jest.Mock).mockReturnValue({
      getApproved: jest.fn().mockResolvedValue('0x0000000000000000000000000000000000000000'),
      populateTransaction: {
        approve: jest.fn().mockReturnValue({
          to: '',
          value: BigInt(0),
          data: '',
        }),
      },
    });

    const approvalTransaction = await transfer.getApprovalTransactions();
    expect(approvalTransaction.length).toBeGreaterThan(0);
  });

  it('approval - returns empty array if approved', async () => {
    const transfer = await createNonFungibleAssetTransfer(TRANSFER_PARAMS);

    (ERC721MinterBurnerPauser__factory.connect as jest.Mock).mockReturnValue({
      getApproved: jest.fn().mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
      populateTransaction: {
        approve: jest.fn().mockReturnValue({
          to: '',
          value: BigInt(0),
          data: '',
        }),
      },
    });

    const approvalTransaction = await transfer.getApprovalTransactions();
    expect(approvalTransaction.length).toEqual(0);
  });
});
