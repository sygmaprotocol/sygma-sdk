import { FeeHandlerType } from '@buildwithsygma/core';
import type { Bridge, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import { type ContractReceipt, type PopulatedTransaction } from 'ethers';

import type { EvmFee } from '../../types.js';
import * as EVM from '../depositFn.js';

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

  beforeEach(() => {
    domainId = 'domainId';
    resourceId = 'resourceId';
    depositData = 'depositData';
    feeData = {
      type: FeeHandlerType.BASIC,
      fee: BigInt('100'),
      tokenAddress: '0x00',
      handlerAddress: '0x9867',
    };

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
        '0x',
        { value: feeData.fee, gasLimit: EVM.ASSET_TRANSFER_GAS_LIMIT },
      );
    });

    it('should successfully call deposit method on contract  without overrides and with dynamic (oracle) fee', async () => {
      feeData = {
        type: FeeHandlerType.PERCENTAGE,
        fee: BigInt('100'),
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
        '0x',
        { gasLimit: EVM.ASSET_TRANSFER_GAS_LIMIT, value: 0 },
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
});
