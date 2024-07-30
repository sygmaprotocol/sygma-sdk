import { FeeHandlerType } from '@buildwithsygma/core';
import type { SubmittableResult } from '@polkadot/api';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import type { SubstrateAssetTransferRequest } from '../fungible.js';
import { createSubstrateFungibleAssetTransfer } from '../fungible.js';
import { deposit, getBasicFee, getFeeHandler, getPercentageFee } from '../utils/index.js';

jest.mock('../utils/index.js');
jest.mock('@polkadot/api', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual('@polkadot/api');
  const mockBalance = {
    data: {
      free: '500',
      reserved: '5000',
      miscFrozen: '5000',
      feeFrozen: '5000',
    },
  };
  const mockChainProperties = {
    tokenDecimals: ['12'],
    tokenSymbol: ['DOT'],
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    ApiPromise: {
      create: jest.fn().mockResolvedValue({
        query: {
          system: {
            account: jest.fn().mockResolvedValue(mockBalance),
          },
        },
        registry: {
          getChainProperties: jest.fn().mockReturnValue(mockChainProperties),
        },
      }),
    },
  };
});

const RHALA_RPC_URL = 'wss://rhala-node.phala.network/ws';
const wsProvider = new WsProvider(RHALA_RPC_URL);

describe('SubstrateFungibleAssetTransfer', () => {
  let api: jest.Mocked<ApiPromise>;
  let transferRequest: SubstrateAssetTransferRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    api = (await ApiPromise.create({ provider: wsProvider })) as jest.Mocked<ApiPromise>;
    transferRequest = {
      sourceAddress: '',
      source: 5, // Substrate
      destination: 1337, // Ethereum
      sourceNetworkProvider: api,
      resource: '0x0000000000000000000000000000000000000000000000000000000000000300',
      amount: BigInt(1000),
      destinationAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
      senderAddress: '5E75Q88u1Hw2VouCiRWoEfKXJMFtqLSUzhqzsH6yWjhd8cem',
    };
  });

  test('should validate Substrate address', async () => {
    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    expect(transfer.destinationAddress).toBe(transferRequest.destinationAddress);
  });

  test('should set the amount', async () => {
    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    transfer.setAmount(BigInt(2000));
    expect(transfer.amount).toBe(BigInt(2000));
  });

  test('should set another EVM destination address', async () => {
    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    transfer.setDestinationAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    expect(transfer.destinationAddress).toBe('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  });

  test('should calculate the basic fee', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(100), type: FeeHandlerType.BASIC });

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    const fee = await transfer.getFee();
    expect(fee).toEqual({ fee: new BN(100), type: FeeHandlerType.BASIC });
  });

  test('should calculate the percentage fee', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.PERCENTAGE);
    (getPercentageFee as jest.Mock).mockResolvedValue({
      fee: new BN(50),
      type: FeeHandlerType.PERCENTAGE,
    });

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    const fee = await transfer.getFee();
    expect(fee).toEqual({ fee: new BN(50), type: FeeHandlerType.PERCENTAGE });
  });

  test('should throw error if transfer amount is less than the fee', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(2000), type: FeeHandlerType.BASIC });

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    await expect(transfer.getTransferTransaction()).rejects.toThrow(
      'Transfer amount should be higher than transfer fee',
    );
  });

  test('should return a valid transfer transaction', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(100), type: FeeHandlerType.BASIC });
    (deposit as jest.Mock).mockResolvedValue(
      {} as SubmittableExtrinsic<'promise', SubmittableResult>,
    );

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    const tx = await transfer.getTransferTransaction();
    expect(tx).toBeDefined();
  });

  test('should return ERROR - when Amount is less than transfer fee', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(2000), type: FeeHandlerType.BASIC });

    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
    await expect(transfer.getTransferTransaction()).rejects.toThrow(
      'Transfer amount should be higher than transfer fee',
    );
  });

  test('should return ERROR - when account balance is not sufficient', async () => {
    (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
    (getBasicFee as jest.Mock).mockResolvedValue({ fee: new BN(100), type: FeeHandlerType.BASIC });

    const insufficientBalanceRequest = {
      ...transferRequest,
      amount: BigInt(1000), // Amount set to trigger insufficient balance
    };

    const transfer = await createSubstrateFungibleAssetTransfer(insufficientBalanceRequest);
    await expect(transfer.getTransferTransaction()).rejects.toThrow(
      'Insufficient balance to perform the Transaction',
    );
  });
});
