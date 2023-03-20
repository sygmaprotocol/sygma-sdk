import { Bridge } from '@buildwithsygma/sygma-contracts';

import { FeeDataResult } from 'types';
import { ethers, providers, ContractReceipt, BigNumber } from 'ethers';

import { executeDeposit } from '../utils/depositFns';

jest.mock('../helpers', () => {
  return {
    isEIP1559MaxFeePerGas: jest.fn().mockResolvedValue(BigNumber.from('100')),
  };
});

// Define a test suite
describe('executeDeposit', () => {
  let domainId: string;
  let resourceId: string;
  let depositData: string;
  let feeData: FeeDataResult;
  let bridgeInstance: Bridge;
  let confirmations: number;
  let provider: providers.Provider;
  let overrides: ethers.PayableOverrides;

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
    confirmations = 1;
    provider = jest.fn() as unknown as providers.Provider;
    overrides = { gasLimit: 30000 };

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully execute deposit', async () => {
    // Mock the required functions
    bridgeInstance = {
      deposit: jest.fn().mockResolvedValueOnce({
        wait: jest.fn().mockResolvedValueOnce({} as ContractReceipt),
      }),
    } as unknown as Bridge;

    // Call the function and test the result
    const result = await executeDeposit(
      domainId,
      resourceId,
      depositData,
      feeData,
      bridgeInstance,
      confirmations,
      provider,
      overrides,
    );

    expect(result).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(bridgeInstance.deposit).toHaveBeenCalledTimes(1);
  });

  it('should handle error on execute deposit', async () => {
    // Mock the required functions
    bridgeInstance.deposit = jest.fn().mockRejectedValueOnce(new Error('Deposit failed'));

    // Mock console.log to prevent logging in tests
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await expect(
      executeDeposit(
        domainId,
        resourceId,
        depositData,
        feeData,
        bridgeInstance,
        confirmations,
        provider,
        overrides,
      ),
    ).rejects.toThrowError('Deposit failed');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    consoleLogSpy.mockRestore();
  });
});
