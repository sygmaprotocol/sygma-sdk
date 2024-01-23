import type { Bridge, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import type {
  DepositEventFilter,
  DepositEvent,
} from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';

import type { ethers, ContractReceipt, PopulatedTransaction } from 'ethers';
import { BigNumber } from 'ethers';
import { FeeHandlerType } from '../../../types/index.js';
import * as EVM from '../utils/depositFns.js';
import type { EvmFee } from '../types/index.js';

jest.mock('../helpers', () => {
  return {
    getTokenDecimals: jest.fn().mockResolvedValue(1),
    createERCDepositData: jest.fn().mockReturnValue('0x0erc20value'),
  };
});
jest.mock('../utils/approvesAndChecksFns', () => ({
  getERC20Allowance: jest.fn().mockResolvedValue(123),
  isApproved: jest.fn().mockResolvedValue(true),
}));

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      Bridge__factory: {
        connect: jest.fn() as unknown as Bridge,
      },
      ERC721MinterBurnerPauser__factory: {
        connect: jest.fn() as unknown as ERC721MinterBurnerPauser,
      },
    }) as unknown,
);

// Define a test suite
describe('deposit functions', () => {
  let domainId: string;
  let resourceId: string;
  let depositData: string;
  let feeData: EvmFee;
  let bridgeInstance: Bridge;

  beforeEach(() => {
    domainId = 'domainId';
    resourceId = 'resourceId';
    depositData = 'depositData';
    feeData = {
      type: FeeHandlerType.BASIC,
      fee: BigNumber.from('100'),
      feeData: 'feeData',
      tokenAddress: '0x00',
      handlerAddress: '0x9867',
    };
    bridgeInstance = { deposit: jest.fn() } as unknown as Bridge;

    // Reset mocks before each test
    jest.clearAllMocks();
  });
  describe('executeDeposit', () => {
    it('should successfully execute deposit', async () => {
      const bridgeInstance = {
        populateTransaction: {
          deposit: jest.fn().mockResolvedValueOnce({
            wait: jest.fn().mockResolvedValueOnce({} as ContractReceipt),
          } as unknown as PopulatedTransaction),
        },
      };

      const result = await EVM.executeDeposit(
        domainId,
        resourceId,
        depositData,
        feeData,
        bridgeInstance as unknown as Bridge,
      );

      expect(result).toBeDefined();
      expect(bridgeInstance.populateTransaction.deposit).toHaveBeenCalledTimes(1);
    });

    it('should successfully call deposit method on contract without overrides', async () => {
      const bridgeInstance = {
        populateTransaction: {
          deposit: jest.fn().mockResolvedValueOnce({
            wait: jest.fn().mockResolvedValueOnce({} as ContractReceipt),
          } as unknown as PopulatedTransaction),
        },
      };

      const result = await EVM.executeDeposit(
        domainId,
        resourceId,
        depositData,
        feeData,
        bridgeInstance as unknown as Bridge,
      );

      expect(result).toBeDefined();
      expect(bridgeInstance.populateTransaction.deposit).toHaveBeenCalledTimes(1);
      expect(bridgeInstance.populateTransaction.deposit).toHaveBeenCalledWith(
        'domainId',
        'resourceId',
        'depositData',
        'feeData',
        { value: feeData.fee, gasLimit: EVM.ASSET_TRANSFER_GAS_LIMIT },
      );
    });

    it('should successfully call deposit method on contract  without overrides and with dynamic (oracle) fee', async () => {
      feeData = {
        type: FeeHandlerType.DYNAMIC,
        fee: BigNumber.from('100'),
        feeData: 'feeData',
        tokenAddress: '0x00',
        handlerAddress: '0x123',
      };
      const bridgeInstance = {
        populateTransaction: {
          deposit: jest.fn().mockResolvedValueOnce({
            wait: jest.fn().mockResolvedValueOnce({} as ContractReceipt),
          } as unknown as PopulatedTransaction),
        },
      };

      const result = await EVM.executeDeposit(
        domainId,
        resourceId,
        depositData,
        feeData,
        bridgeInstance as unknown as Bridge,
      );

      expect(result).toBeDefined();
      expect(bridgeInstance.populateTransaction.deposit).toHaveBeenCalledTimes(1);
      expect(bridgeInstance.populateTransaction.deposit).toHaveBeenCalledWith(
        'domainId',
        'resourceId',
        'depositData',
        'feeData',
        { gasLimit: EVM.ASSET_TRANSFER_GAS_LIMIT, value: BigNumber.from(100) },
      );
    });

    it('should handle error on execute deposit', async () => {
      const bridgeInstance = {
        populateTransaction: {
          deposit: jest.fn().mockRejectedValueOnce(new Error('Deposit failed')),
        },
      };

      await expect(
        EVM.executeDeposit(
          domainId,
          resourceId,
          depositData,
          feeData,
          bridgeInstance as unknown as Bridge,
        ),
      ).rejects.toThrowError('Deposit failed');
    });
  });

  describe('erc20Transfer', () => {
    it('should successfully execute', async () => {
      jest.spyOn(EVM, 'executeDeposit').mockResolvedValueOnce({} as ethers.PopulatedTransaction);
      bridgeInstance = {
        signer: {
          getAddress: jest.fn().mockResolvedValue('0xMyaddress'),
        },
      } as unknown as Bridge;

      const erc20Params = {
        amount: '100',
        recipientAddress: '0x123',
        bridgeInstance,
        domainId,
        resourceId,
        feeData,
      };
      await EVM.erc20Transfer(erc20Params);

      expect(EVM.executeDeposit).toBeCalledWith(
        domainId,
        resourceId,
        '0x0erc20value',
        feeData,
        bridgeInstance,
        undefined,
      );
    });
  });

  describe('erc721Transfer', () => {
    it('should successfully execute', async () => {
      jest.spyOn(EVM, 'executeDeposit').mockResolvedValueOnce({} as ethers.PopulatedTransaction);

      const erc721Params = {
        id: '100',
        recipientAddress: '0x123',
        bridgeInstance,
        domainId,
        resourceId,
        feeData,
      };
      await EVM.erc721Transfer(erc721Params);

      expect(EVM.executeDeposit).toBeCalledWith(
        domainId,
        resourceId,
        '0x0erc20value',
        feeData,
        bridgeInstance,
        undefined,
      );
    });
  });

  it('should successfully run getDepositEventFromReceipt', async () => {
    const depositEventData = {
      destinationDomainID: 111,
      resourceID: 'asd',
      depositNonce: BigNumber.from('222'),
      user: 'user',
      data: 'ddd',
      handlerResponse: 'resp',
    } as unknown as DepositEvent;
    const bridgeInstance = {
      filters: {
        Deposit: jest.fn() as unknown as DepositEventFilter,
      },
      queryFilter: jest.fn().mockResolvedValue([depositEventData]),
    } as unknown as Bridge;

    const receipt = { blockHash: '0x123' } as unknown as ContractReceipt;

    const result = await EVM.getDepositEventFromReceipt(receipt, bridgeInstance);

    expect(result).toBe(depositEventData);
  });

  it('should rejects getDepositEventFromReceipt in case of error', async () => {
    const bridgeInstance = {
      filters: {
        Deposit: jest.fn() as unknown as DepositEventFilter,
      },
      queryFilter: jest.fn().mockRejectedValue(new Error('Sick Error')),
    } as unknown as Bridge;

    const receipt = { blockHash: '0x123' } as unknown as ContractReceipt;

    await expect(EVM.getDepositEventFromReceipt(receipt, bridgeInstance)).rejects.toThrowError(
      'Sick Error',
    );
  });
});
