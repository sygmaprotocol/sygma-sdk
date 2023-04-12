import { Bridge, ERC20, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import {
  DepositEventFilter,
  DepositEvent,
} from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';

import { FeeDataResult } from 'types';
import { ethers, providers, ContractReceipt, ContractTransaction, BigNumber } from 'ethers';
import { TokenTransfer } from '../types';
import * as EVM from '../utils/depositFns';

jest.mock('../helpers', () => {
  return {
    isEIP1559MaxFeePerGas: jest.fn().mockResolvedValue(BigNumber.from('100')),
    getTokenDecimals: jest.fn().mockResolvedValue(1),
    constructDepositDataEvmSubstrate: jest.fn().mockReturnValue('0xdepositData'),
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
    } as unknown),
);

// Define a test suite
describe('deposit functions', () => {
  let domainId: string;
  let resourceId: string;
  let depositData: string;
  let feeData: FeeDataResult;
  let bridgeInstance: Bridge;
  let provider: providers.Provider;
  let overrides: ethers.PayableOverrides;
  let handlerAddress: string;

  beforeEach(() => {
    domainId = 'domainId';
    resourceId = 'resourceId';
    depositData = 'depositData';
    feeData = {
      type: 'basic',
      fee: BigNumber.from('100'),
      feeData: 'feeData',
      calculatedRate: '1.5',
      erc20TokenAddress: '0x00',
    };
    bridgeInstance = { deposit: jest.fn() } as unknown as Bridge;
    provider = jest.fn() as unknown as providers.Provider;
    overrides = { gasLimit: 30000 };
    handlerAddress = '0x9867';

    // Reset mocks before each test
    jest.clearAllMocks();
  });
  describe('executeDeposit', () => {
    it('should successfully execute deposit', async () => {
      // Mock the required functions
      const bridgeInstance = {
        deposit: jest.fn().mockResolvedValueOnce({
          wait: jest.fn().mockResolvedValueOnce({} as ContractReceipt),
        } as unknown as ContractTransaction),
      };

      // Call the function and test the result
      const result = await EVM.executeDeposit(
        domainId,
        resourceId,
        depositData,
        feeData,
        bridgeInstance as unknown as Bridge,
        provider,
        overrides,
      );

      expect(result).toBeDefined();
      expect(bridgeInstance.deposit).toHaveBeenCalledTimes(1);
    });

    it('should handle error on execute deposit', async () => {
      // Mock the required functions
      bridgeInstance.deposit = jest.fn().mockRejectedValueOnce(new Error('Deposit failed'));

      // Mock console.log to prevent logging in tests
      const consoleLogSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        EVM.executeDeposit(
          domainId,
          resourceId,
          depositData,
          feeData,
          bridgeInstance,
          provider,
          overrides,
        ),
      ).rejects.toThrowError('Deposit failed');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      consoleLogSpy.mockRestore();
    });
  });
  describe('erc20Transfer', () => {
    it('should successfully execute', async () => {
      jest.spyOn(EVM, 'executeDeposit').mockResolvedValueOnce({} as ContractTransaction);
      bridgeInstance = {
        signer: {
          getAddress: jest.fn().mockResolvedValue('0xMyaddress'),
        },
      } as unknown as Bridge;

      const tokenInstance = {} as ERC20;

      const erc20Params = {
        amountOrId: '100',
        recipientAddress: '0x123',
        tokenInstance,
        bridgeInstance,
        provider,
        handlerAddress,
        domainId,
        resourceId,
        feeData,
        overrides,
      };
      await EVM.erc20Transfer(erc20Params);

      expect(EVM.executeDeposit).toBeCalledWith(
        domainId,
        resourceId,
        '0xdepositData',
        feeData,
        bridgeInstance,
        provider,
        overrides,
      );
    });
  });
  describe('erc721Transfer', () => {
    it('should successfully execute', async () => {
      jest.spyOn(EVM, 'executeDeposit').mockResolvedValueOnce({} as ContractTransaction);

      const tokenInstance = {} as ERC721MinterBurnerPauser;

      const erc721Params = {
        amountOrId: '100',
        recipientAddress: '0x123',
        tokenInstance,
        bridgeInstance,
        provider,
        handlerAddress,
        domainId,
        resourceId,
        feeData,
        overrides,
      };
      await EVM.erc721Transfer(erc721Params);

      expect(EVM.executeDeposit).toBeCalledWith(
        domainId,
        resourceId,
        '0x0erc20value',
        feeData,
        bridgeInstance,
        provider,
        overrides,
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

  describe('processTokenTranfer', () => {
    it('should throw an error when selectedToken is undefined', async () => {
      await expect(
        EVM.processTokenTranfer({
          depositParams: { resourceId: '123' },
          bridgeConfig: {
            tokens: [{ resourceId: '456', type: 'erc20', address: '0x123' }],
            bridgeAddress: '0x123',
            domainId: '1',
          },
          provider,
          overrides,
        } as unknown as TokenTransfer),
      ).rejects.toThrowError(`Can't find in networkConfig token with resourceID: 123`);
    });

    it('should throw an error when token type is undefined', async () => {
      await expect(
        EVM.processTokenTranfer({
          depositParams: { resourceId: '456' },
          bridgeConfig: {
            tokens: [{ resourceId: '456', address: '0x123' }],
            bridgeAddress: '0x123',
            domainId: '1',
            erc721HandlerAddress: '0x123',
          },
          provider,
          overrides,
        } as unknown as TokenTransfer),
      ).rejects.toThrowError(`Unsupported token type: undefined`);
    });

    it('should throw an error when token type is erc1155', async () => {
      await expect(
        EVM.processTokenTranfer({
          depositParams: { resourceId: '456' },
          bridgeConfig: {
            tokens: [{ resourceId: '456', type: 'erc1155', address: '0x123' }],
            bridgeAddress: '0x123',
            domainId: '1',
            erc721HandlerAddress: '0x123',
          },
          provider,
          overrides,
        } as unknown as TokenTransfer),
      ).rejects.toThrowError(`Unsupported token type: erc1155`);
    });

    it('should call erc721Transfer function when given a selectedToken with type erc721', async () => {
      jest
        .spyOn(EVM, 'erc721Transfer')
        .mockResolvedValue({ blockHash: '0x01' } as unknown as ContractTransaction);
      const receipt = await EVM.processTokenTranfer({
        depositParams: { resourceId: '456' },
        bridgeConfig: {
          tokens: [{ resourceId: '456', type: 'erc721', address: '0x123' }],
          bridgeAddress: '0x123',
          domainId: '1',
          erc721HandlerAddress: '0x123',
        },
        provider,
        overrides,
      } as unknown as TokenTransfer);

      expect(receipt).toMatchObject({ blockHash: '0x01' });
    });

    it('should call erc20Transfer function when given a selectedToken with type erc20', async () => {
      jest
        .spyOn(EVM, 'erc20Transfer')
        .mockResolvedValue({ blockHash: '0x01' } as unknown as ContractTransaction);
      const receipt = await EVM.processTokenTranfer({
        depositParams: { resourceId: '456' },
        bridgeConfig: {
          tokens: [{ resourceId: '456', type: 'erc20', address: '0x123' }],
          bridgeAddress: '0x123',
          domainId: '1',
          erc20HandlerAddress: '0x123',
        },
        provider: new ethers.providers.JsonRpcProvider(),
        overrides: { gasLimit: 100000 },
      } as unknown as TokenTransfer);

      expect(receipt).toMatchObject({ blockHash: '0x01' });
    });
  });
});
