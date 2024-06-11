import type { SubstrateResource } from '@buildwithsygma/core';
import { Config, FeeHandlerType, LiquidityError, ResourceType } from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import { domainsMock } from '../../test/dataMocks.js';
import { BaseTransfer } from '../base-transfer.js';
import {
  createSubstrateFungibleAssetTransfer,
  SubstrateFungibleAssetTransfer,
} from '../fungible.js';
import { getBasicFee, getFeeHandler, getLiquidity, getPercentageFee } from '../utils/index.js';

jest.mock('../utils');
jest.mock('@buildwithsygma/core', (): object => ({
  ...jest.requireActual('@buildwithsygma/core'),
  Config: jest.fn().mockImplementation(() => ({
    configuration: domainsMock,
    initialized: true,
    init: jest.fn(),
    getDomainConfig: jest.fn().mockReturnValue(domainsMock.domains[1]),
    getDomain: jest
      .fn()
      .mockReturnValueOnce(domainsMock.domains[1])
      .mockReturnValueOnce(domainsMock.domains[2]),
    getResources: jest.fn().mockReturnValue(domainsMock.domains[1].resources),
  })),
}));

const mockGetBasicFee = getBasicFee as jest.MockedFunction<typeof getBasicFee>;
const mockGetFeeHandler = getFeeHandler as jest.MockedFunction<typeof getFeeHandler>;
const mockGetPercentageFee = getPercentageFee as jest.MockedFunction<typeof getPercentageFee>;
const mockGetLiquidity = getLiquidity as jest.MockedFunction<typeof getLiquidity>;

describe('SubstrateFungibleAssetTransfer', () => {
  let isValidTransferSpy: jest.SpyInstance;

  const transferRequest = {
    sourceDomain: 5231, // rococo-phala chainId
    destinationDomain: 84532, // base_sepolia chainId
    sourceNetworkProvider: {} as ApiPromise,
    resource: domainsMock.domains.find(domain => domain.chainId === 5231)!
      .resources[1] as SubstrateResource,
    amount: BigInt(1000),
    destinationAddress: 'destinationAddress',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    isValidTransferSpy = jest.spyOn(BaseTransfer.prototype, 'isValidTransfer');
  });

  afterEach(() => {
    isValidTransferSpy.mockRestore();
  });

  it('should create a SubstrateFungibleAssetTransfer successfully', async () => {
    mockGetLiquidity.mockResolvedValueOnce(BigInt(10000));
    isValidTransferSpy.mockResolvedValue(true);
    const transfer = await createSubstrateFungibleAssetTransfer(transferRequest);

    expect(transfer).toBeInstanceOf(SubstrateFungibleAssetTransfer);
  });

  it('should throw an error if the handler is not registered', async () => {
    mockGetLiquidity.mockResolvedValueOnce(BigInt(10000));
    isValidTransferSpy.mockResolvedValue(false);
    Config.prototype.getDomainConfig = jest.fn().mockReturnValueOnce({
      handlers: [],
      resources: [],
    });

    await expect(createSubstrateFungibleAssetTransfer(transferRequest)).rejects.toThrow(
      'Handler not registered, please check if this is a valid bridge route.',
    );
  });

  it('should throw an error if the liquidity is insufficient', async () => {
    Config.prototype.getDomainConfig = jest.fn().mockReturnValueOnce({
      handlers: [{ type: ResourceType.FUNGIBLE, address: 'handlerAddress' }],
      resources: [{ resourceId: 'resourceId' }],
    });

    mockGetLiquidity.mockResolvedValueOnce(BigInt(500));

    await expect(createSubstrateFungibleAssetTransfer(transferRequest)).rejects.toThrow(
      LiquidityError,
    );
  });

  describe('SubstrateFungibleAssetTransfer Class', () => {
    it('should return the fee using BASIC handler', async () => {
      mockGetFeeHandler.mockResolvedValue(FeeHandlerType.BASIC);
      mockGetBasicFee.mockResolvedValue({ fee: new BN(100), type: FeeHandlerType.BASIC });

      const transfer = new SubstrateFungibleAssetTransfer(transferRequest, new Config());
      const fee = await transfer.getFee();

      expect(fee).toEqual({ fee: new BN(100), type: FeeHandlerType.BASIC });
    });

    it('should return the fee using PERCENTAGE handler', async () => {
      mockGetFeeHandler.mockResolvedValue(FeeHandlerType.PERCENTAGE);
      mockGetPercentageFee.mockResolvedValue({ fee: new BN(50), type: FeeHandlerType.PERCENTAGE });

      const transfer = new SubstrateFungibleAssetTransfer(transferRequest, new Config());
      const fee = await transfer.getFee();

      expect(fee).toEqual({ fee: new BN(50), type: FeeHandlerType.PERCENTAGE });
    });

    it('should return a transfer transaction for FUNGIBLE resource type', async () => {
      mockGetFeeHandler.mockResolvedValue(FeeHandlerType.BASIC);
      mockGetBasicFee.mockResolvedValue({ fee: new BN(100), type: FeeHandlerType.BASIC });

      const transfer = new SubstrateFungibleAssetTransfer(transferRequest, new Config());
      jest
        .spyOn(transfer, 'getFee')
        .mockResolvedValueOnce({ fee: new BN(100), type: FeeHandlerType.BASIC });

      const mockDeposit = jest
        .spyOn(transfer, 'getTransferTransaction')
        .mockResolvedValueOnce({} as SubmittableExtrinsic<'promise', SubmittableResult>);
      const result = await transfer.getTransferTransaction();

      expect(mockDeposit).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw an error if transfer amount is less than the fee', async () => {
      mockGetFeeHandler.mockResolvedValue(FeeHandlerType.BASIC);
      mockGetBasicFee.mockResolvedValue({ fee: new BN(2000), type: FeeHandlerType.BASIC });

      const transfer = new SubstrateFungibleAssetTransfer(transferRequest, new Config());

      await expect(transfer.getTransferTransaction()).rejects.toThrow(
        'Transfer amount should be higher than transfer fee',
      );
    });
  });
});
