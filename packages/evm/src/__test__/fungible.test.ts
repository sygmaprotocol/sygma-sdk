import { Network, Config, ResourceType } from '@buildwithsygma/core';
import {
  BasicFeeHandler__factory,
  Bridge__factory,
  ERC20__factory,
  FeeHandlerRouter__factory,
  PercentageERC20FeeHandler__factory,
} from '@buildwithsygma/sygma-contracts';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils.js';

import { createFungibleAssetTransfer } from '../fungibleAssetTransfer.js';

import { ASSET_TRANSFER_PARAMS } from './constants.js';

const TRANSFER_PARAMS = {
  ...ASSET_TRANSFER_PARAMS,
  resource: {
    ...ASSET_TRANSFER_PARAMS.resource,
    type: ResourceType.NON_FUNGIBLE,
  },
  amount: parseEther('10').toBigInt(),
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
  Web3Provider: jest.fn().mockImplementation(() => {
    return {
      getBalance: jest.fn().mockResolvedValue(BigNumber.from('110000000000000000')),
    };
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@buildwithsygma/sygma-contracts', () => ({
  ...jest.requireActual('@buildwithsygma/sygma-contracts'),
  Bridge__factory: { connect: jest.fn() },
  ERC20__factory: {
    balanceOf: jest.fn().mockResolvedValue(BigInt(1)),
    connect: jest.fn(),
  },
  BasicFeeHandler__factory: { connect: jest.fn() },
  PercentageERC20FeeHandler__factory: { connect: jest.fn() },
  FeeHandlerRouter__factory: { connect: jest.fn() },
}));

describe('Fungible - createEvmFungibleAssetTransfer', () => {
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
    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);
    expect(transfer).toBeTruthy();
    expect(transfer.transferAmount).toEqual(parseEther('10').toBigInt());
  });

  it('should fail if fee handler is not registered', async () => {
    (FeeHandlerRouter__factory.connect as jest.Mock).mockReturnValue({
      _domainResourceIDToFeeHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x0000000000000000000000000000000000000000'),
    });

    await expect(async () => await createFungibleAssetTransfer(TRANSFER_PARAMS)).rejects.toThrow(
      'Fee Handler not found for Resource ID 0x0 to Domain 1',
    );
  });
});

describe('Fungible - Fee', () => {
  beforeAll(() => {
    (Config as jest.Mock).mockReturnValue(MOCKED_CONFIG);

    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('basic'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
    });

    (PercentageERC20FeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
      _resourceIDToFeeBounds: jest.fn().mockResolvedValue({
        lowerBound: parseEther('10'),
        upperBound: parseEther('100'),
      }),
      _domainResourceIDToFee: jest.fn().mockResolvedValue(BigNumber.from(100)),
      HUNDRED_PERCENT: jest.fn().mockResolvedValue(10000),
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

  it('should return fee for a transfer', async () => {
    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);
    const fee = await transfer.getFee();

    expect(fee.fee).toEqual(0n);
    expect(fee.type).toEqual('basic');
    expect(fee.handlerAddress).toEqual('0x98729c03c4D5e820F5e8c45558ae07aE63F97461');
  });

  it('should return percentage fee for percentage transfer', async () => {
    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
    });

    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);
    const fee = await transfer.getFee();

    expect(fee.type).toEqual('percentage');
    expect(fee.handlerAddress).toEqual('0x98729c03c4D5e820F5e8c45558ae07aE63F97461');
  });

  it('should query fee with deposit data', async () => {
    const calculateFee = jest.fn().mockResolvedValue([BigNumber.from(0)]);

    (PercentageERC20FeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee,
      _resourceIDToFeeBounds: jest.fn().mockResolvedValue({
        lowerBound: parseEther('10'),
        upperBound: parseEther('100'),
      }),
      _domainResourceIDToFee: jest.fn().mockResolvedValue(BigNumber.from(100)),
      HUNDRED_PERCENT: jest.fn().mockResolvedValue(10000),
    });

    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
    });

    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);
    await transfer.getFee();

    const actualDepositData = (calculateFee.mock.calls as string[][])[0][4];
    const expectedDepositData =
      '0x0000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000000000000000000001498729c03c4d5e820f5e8c45558ae07ae63f97461';

    expect(actualDepositData).toEqual(expectedDepositData);
  });
});

describe('Fungible - Approvals', () => {
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

    (ERC20__factory.connect as jest.Mock).mockReturnValue({
      balanceOf: jest.fn().mockResolvedValue(BigNumber.from(parseEther('50'))),
      populateTransaction: {
        approve: jest.fn().mockResolvedValue({}),
      },
      allowance: jest.fn().mockResolvedValue(parseEther('0')),
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

  it('should return approvals for a transfer', async () => {
    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);
    const approvals = await transfer.getApprovalTransactions();

    expect(approvals.length).toBeGreaterThan(0);
  });

  it('should throw an error if balance is not sufficient - Basic', async () => {
    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('basic'),
      calculateFee: jest.fn().mockResolvedValue([parseEther('1')]),
    });

    const transfer = await createFungibleAssetTransfer({
      ...TRANSFER_PARAMS,
      amount: parseEther('0').toBigInt(),
    });

    await expect(transfer.getApprovalTransactions()).rejects.toThrow('Insufficient balance');
  });

  it('should throw an error if balance is not sufficient - Percentage', async () => {
    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
    });
    (PercentageERC20FeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
      _resourceIDToFeeBounds: jest.fn().mockResolvedValue({
        lowerBound: parseEther('10'),
        upperBound: parseEther('100'),
      }),
      _domainResourceIDToFee: jest.fn().mockResolvedValue(BigNumber.from(100)),
      HUNDRED_PERCENT: jest.fn().mockResolvedValue(10000),
    });
    (ERC20__factory.connect as jest.Mock).mockReturnValue({
      balanceOf: jest.fn().mockResolvedValue(BigNumber.from(parseEther('0').toBigInt())), // Mock balance less than the required amount
      populateTransaction: {
        approve: jest.fn().mockResolvedValue({}),
      },
      allowance: jest.fn().mockResolvedValue(parseEther('0')),
    });

    const transfer = await createFungibleAssetTransfer({
      ...TRANSFER_PARAMS,
      amount: parseEther('100').toBigInt(),
    });

    await expect(transfer.getApprovalTransactions()).rejects.toThrow('Insufficient balance');
  });
});

describe('Fungible - Deposit', () => {
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

    (ERC20__factory.connect as jest.Mock).mockReturnValue({
      balanceOf: jest.fn().mockResolvedValue(BigNumber.from(parseEther('50').toBigInt())),
      populateTransaction: {
        approve: jest.fn().mockResolvedValue({}),
      },
      allowance: jest.fn().mockResolvedValue(parseEther('0')),
    });

    (Bridge__factory.connect as jest.Mock).mockReturnValue({
      populateTransaction: {
        deposit: jest.fn().mockReturnValue({
          to: '',
          value: BigInt(0),
          data: '',
          gasLimit: BigNumber.from('1'),
          gasPrice: BigNumber.from('1'),
        }),
      },
      _resourceIDToHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
      _feeHandler: jest.fn().mockResolvedValue('0x98729c03c4D5e820F5e8c45558ae07aE63F97461'),
    });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return deposit transaction', async () => {
    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);
    const depositTransaction = await transfer.getTransferTransaction();

    expect(depositTransaction).toBeTruthy();
  });

  it('should return deposit transaction with overrides', async () => {
    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);
    const depositTransaction = await transfer.getTransferTransaction({
      gasLimit: 1n,
      gasPrice: 1n,
    });

    expect(depositTransaction.gasLimit).toEqual(1n);
    expect(depositTransaction.gasPrice).toEqual(1n);
  });

  it('should throw ERROR - Insufficient account balance - Percentage', async () => {
    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
    });
    (PercentageERC20FeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('percentage'),
      calculateFee: jest.fn().mockResolvedValue([BigNumber.from(0)]),
      _resourceIDToFeeBounds: jest.fn().mockResolvedValue({
        lowerBound: parseEther('10'),
        upperBound: parseEther('100'),
      }),
      _domainResourceIDToFee: jest.fn().mockResolvedValue(BigNumber.from(100)),
      HUNDRED_PERCENT: jest.fn().mockResolvedValue(10000),
    });
    (ERC20__factory.connect as jest.Mock).mockReturnValue({
      balanceOf: jest.fn().mockResolvedValue(BigNumber.from(parseEther('0').toBigInt())), // Mock balance less than the required amount
      populateTransaction: {
        approve: jest.fn().mockResolvedValue({}),
      },
      allowance: jest.fn().mockResolvedValue(parseEther('0')),
    });

    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);

    await expect(transfer.getTransferTransaction()).rejects.toThrow('Insufficient token balance');
  });

  it('should throw ERROR - Insufficient account balance', async () => {
    (BasicFeeHandler__factory.connect as jest.Mock).mockReturnValue({
      feeHandlerType: jest.fn().mockResolvedValue('basic'),
      calculateFee: jest.fn().mockResolvedValue([parseEther('2')]),
    });

    (ERC20__factory.connect as jest.Mock).mockReturnValue({
      balanceOf: jest.fn().mockResolvedValue(BigNumber.from(parseEther('1').toBigInt())), // Mock balance less than the required amount
      populateTransaction: {
        approve: jest.fn().mockResolvedValue({}),
      },
      allowance: jest.fn().mockResolvedValue(parseEther('0')),
    });

    const transfer = await createFungibleAssetTransfer(TRANSFER_PARAMS);

    await expect(transfer.getTransferTransaction()).rejects.toThrow('Insufficient token balance');
  });
});
