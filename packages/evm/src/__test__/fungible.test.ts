import type { Eip1193Provider } from '@buildwithsygma/core';
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

import { createEvmFungibleAssetTransfer } from '../fungible.js';
import type { TransactionRequest } from '../types.js';

const TRANSFER_PARAMS = {
  source: 1,
  destination: 2,
  sourceAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
  sourceNetworkProvider: jest.fn() as unknown as Eip1193Provider,
  resource: {
    address: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
    type: ResourceType.FUNGIBLE,
    resourceId: '0x0',
    caip19: '0x11',
  },
  amount: parseEther('10').toBigInt(),
  destinationAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
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
    const transfer = await createEvmFungibleAssetTransfer(TRANSFER_PARAMS);
    expect(transfer).toBeTruthy();
    expect(transfer.amount).toEqual(parseEther('10').toBigInt());
  });

  it('should fail if fee handler is not registered', async () => {
    (FeeHandlerRouter__factory.connect as jest.Mock).mockReturnValue({
      _domainResourceIDToFeeHandlerAddress: jest
        .fn()
        .mockResolvedValue('0x0000000000000000000000000000000000000000'),
    });

    await expect(async () => await createEvmFungibleAssetTransfer(TRANSFER_PARAMS)).rejects.toThrow(
      'Failed getting fee: route not registered on fee handler',
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
    const transfer = await createEvmFungibleAssetTransfer(TRANSFER_PARAMS);
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

    const transfer = await createEvmFungibleAssetTransfer(TRANSFER_PARAMS);
    const fee = await transfer.getFee();

    // expect(fee.fee).toEqual(0n);
    expect(fee.type).toEqual('percentage');
    expect(fee.handlerAddress).toEqual('0x98729c03c4D5e820F5e8c45558ae07aE63F97461');
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
    const transfer = await createEvmFungibleAssetTransfer(TRANSFER_PARAMS);
    const approvals = await transfer.getApprovalTransactions();

    expect(approvals.length).toBeGreaterThan(0);
  });

  it('should throw an error if balance is not sufficient', async () => {
    const transfer = await createEvmFungibleAssetTransfer({
      ...TRANSFER_PARAMS,
      amount: parseEther('100').toBigInt(),
    });

    await expect(transfer.getApprovalTransactions()).rejects.toThrow(
      'Insufficient ERC20 token balance',
    );
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
          gasLimit: BigInt(0),
        } as TransactionRequest),
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
    const transfer = await createEvmFungibleAssetTransfer(TRANSFER_PARAMS);
    const depositTransaction = await transfer.getTransferTransaction();

    expect(depositTransaction).toBeTruthy();
  });

  it('should throw ERROR - Insufficient account balance', async () => {
    (ERC20__factory.connect as jest.Mock).mockReturnValue({
      balanceOf: jest.fn().mockResolvedValue(BigNumber.from(parseEther('1').toBigInt())), // Mock balance less than the required amount
      populateTransaction: {
        approve: jest.fn().mockResolvedValue({}),
      },
      allowance: jest.fn().mockResolvedValue(parseEther('0')),
    });

    const transfer = await createEvmFungibleAssetTransfer(TRANSFER_PARAMS);

    await expect(transfer.getTransferTransaction()).rejects.toThrow(
      'Insufficient ERC20 token balance',
    );
  });
});
