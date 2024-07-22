import { FeeHandlerType } from '@buildwithsygma/core';
import type { Bridge, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import { type ethers, type ContractReceipt, type PopulatedTransaction, BigNumber } from 'ethers';

import type { EvmFee } from '../../types.js';
import * as EVM from '../depositFns.js';

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
      fee: BigInt('100'),
      tokenAddress: '0x00',
      handlerAddress: '0x9867',
    };
    bridgeInstance = { deposit: jest.fn() } as unknown as Bridge;

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
        BigNumber.from(feeData.fee).toHexString(),
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
        BigNumber.from(feeData.fee).toHexString(),
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

  describe('erc20Transfer', () => {
    it('should successfully execute', async () => {
      jest.spyOn(EVM, 'executeDeposit').mockResolvedValueOnce({} as ethers.PopulatedTransaction);
      bridgeInstance = {
        signer: {
          getAddress: jest.fn().mockResolvedValue('0xMyaddress'),
        },
      } as unknown as Bridge;

      const depositData =
        '0x0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000001498729c03c4d5e820f5e8c45558ae07ae63f97461';

      const erc20Params = {
        amount: BigInt('100'),
        recipientAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
        bridgeInstance,
        domainId,
        resourceId,
        feeData,
        depositData,
      };
      await EVM.erc20Transfer(erc20Params);

      expect(EVM.executeDeposit).toBeCalledWith(
        domainId,
        resourceId,
        depositData,
        feeData,
        bridgeInstance,
        undefined,
      );
    });
  });
});
