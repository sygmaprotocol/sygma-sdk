import { FeeHandlerType } from '@buildwithsygma/core';
import type { SubmittableResult } from '@polkadot/api';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import type { SubstrateAssetTransferRequest } from '../fungible.js';
import { createSubstrateFungibleAssetTransfer } from '../fungible.js';
import {
  deposit,
  getAssetBalance,
  getBasicFee,
  getFeeHandler,
  getNativeTokenBalance,
  getPercentageFee,
} from '../utils/index.js';

jest.mock('../utils/index.js');

const RHALA_RPC_URL = 'wss://rhala-node.phala.network/ws';
const wsProvider = new WsProvider(RHALA_RPC_URL);

describe('SubstrateFungibleAssetTransfer', () => {
  let api: jest.Mocked<ApiPromise>;
  let transferRequest: SubstrateAssetTransferRequest;

  beforeAll(async () => {
    api = (await ApiPromise.create({ provider: wsProvider })) as jest.Mocked<ApiPromise>;
    transferRequest = {
      sourceAddress: '5E75Q88u1Hw2VouCiRWoEfKXJMFtqLSUzhqzsH6yWjhd8cem',
      source: 5, // Substrate
      destination: 1337, // Ethereum
      sourceNetworkProvider: api,
      resource: '0x0000000000000000000000000000000000000000000000000000000000000300',
      amount: BigInt(100),
      destinationAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubstrateFungibleAssetTransfer - constructor', () => {
    test('should set constructor values', async () => {
      const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);

      expect(transfer.amount).toBe(BigInt(100));
      expect(transfer.sourceNetworkProvider).toBe(transfer.sourceNetworkProvider);
      expect(transfer.destinationAddress).toBe(transferRequest.destinationAddress);
    });

    test('should throw an error if destination address is Invalid', async () => {
      const invalidDestinationAddress = 'someAddress';
      const transfer = createSubstrateFungibleAssetTransfer({
        ...transferRequest,
        destinationAddress: invalidDestinationAddress,
      });

      await expect(() => transfer).rejects.toThrow('Invalid EVM Address');
    });
  });

  describe('setDestinationAddress', () => {
    test('should set another EVM destination address', async () => {
      const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
      transfer.setDestinationAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      expect(transfer.destinationAddress).toBe('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    });

    test('should not set an invalid destination address', async () => {
      const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
      const invalidAddress = 'invalidAddress';

      expect(() => transfer.setDestinationAddress(invalidAddress)).toThrow('Invalid EVM Address');
    });
  });

  describe('getFee', () => {
    test('should calculate the basic fee', async () => {
      (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
      (getBasicFee as jest.Mock).mockResolvedValue({
        fee: new BN(100),
        type: FeeHandlerType.BASIC,
      });

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
  });

  describe('getTransferTransaction', () => {
    test('should return a valid transfer transaction', async () => {
      (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
      (getBasicFee as jest.Mock).mockResolvedValue({
        fee: new BN(100),
        type: FeeHandlerType.BASIC,
      });
      (deposit as jest.Mock).mockResolvedValue(
        {} as SubmittableExtrinsic<'promise', SubmittableResult>,
      );
      (getAssetBalance as jest.Mock).mockResolvedValue({ balance: BigInt(1000) });
      (getNativeTokenBalance as jest.Mock).mockResolvedValue({ free: BigInt(100) });

      const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
      const tx = await transfer.getTransferTransaction();
      expect(tx).toBeDefined();
    });

    test('should throw ERROR - when native balance is not sufficient', async () => {
      (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
      (getBasicFee as jest.Mock).mockResolvedValue({
        fee: new BN(2000),
        type: FeeHandlerType.BASIC,
      });
      (getAssetBalance as jest.Mock).mockResolvedValue({ balance: BigInt(1) });

      const insufficientBalanceRequest = {
        ...transferRequest,
        amount: BigInt(1000), // Amount set to trigger insufficient balance
      };

      const transfer = await createSubstrateFungibleAssetTransfer(insufficientBalanceRequest);
      await expect(transfer.getTransferTransaction()).rejects.toThrow(
        'Insufficient balance to perform the Transaction',
      );
    });

    test('should throw ERROR - Transferable Token is not sufficient - basic', async () => {
      (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
      (getBasicFee as jest.Mock).mockResolvedValue({
        fee: new BN(2000),
        type: FeeHandlerType.PERCENTAGE,
      });
      (getAssetBalance as jest.Mock).mockResolvedValue({ balance: BigInt(0) });

      const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
      await expect(transfer.getTransferTransaction()).rejects.toThrow(
        'Insufficient asset balance to perform the Transaction',
      );
    });

    test('should throw ERROR - Transferable Token is not sufficient - Percentage', async () => {
      (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.PERCENTAGE);
      (getPercentageFee as jest.Mock).mockResolvedValue({
        fee: new BN(100),
        type: FeeHandlerType.PERCENTAGE,
      });
      (getAssetBalance as jest.Mock).mockResolvedValue({ balance: BigInt(0) });

      const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);
      await expect(transfer.getTransferTransaction()).rejects.toThrow(
        'Insufficient asset balance to perform the Transaction',
      );
    });
  });

  describe('verifyBalance', () => {
    test('should pass balance verification when balance is sufficient', async () => {
      (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.BASIC);
      (getBasicFee as jest.Mock).mockResolvedValue({
        fee: new BN(500),
        type: FeeHandlerType.BASIC,
      });
      (getNativeTokenBalance as jest.Mock).mockResolvedValue({ free: BigInt(500) });

      const sufficientBalanceRequest = {
        ...transferRequest,
        amount: BigInt(1),
      };

      const transfer = await createSubstrateFungibleAssetTransfer(sufficientBalanceRequest);
      await expect(transfer.verifyBalance()).resolves.not.toThrow();
    });

    test('should throw ERROR - when sender address is invalid', async () => {
      (getFeeHandler as jest.Mock).mockResolvedValue(FeeHandlerType.PERCENTAGE);
      (getPercentageFee as jest.Mock).mockResolvedValue({
        fee: new BN(50),
        type: FeeHandlerType.PERCENTAGE,
      });

      const invalidSenderRequest = {
        ...transferRequest,
        sourceAddress: 'invalidAddress',
      };

      const transfer = await createSubstrateFungibleAssetTransfer(invalidSenderRequest);
      await expect(transfer.verifyBalance()).rejects.toThrow('Invalid Substrate Address');
    });
  });
});
