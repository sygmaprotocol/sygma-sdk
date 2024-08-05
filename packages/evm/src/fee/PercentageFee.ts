import { FeeHandlerType } from '@buildwithsygma/core';
import { PercentageERC20FeeHandler__factory } from '@buildwithsygma/sygma-contracts';
import { utils } from 'ethers';

import type { EvmFee } from '../types.js';

import type { EvmFeeCalculationParams } from './types.js';
import { BaseEvmTransferFeeCalculator } from './types.js';

/**
 * @category EvmFee
 * PercentageFeeCalculator provides
 * ability to calculate fee for a route
 * that uses percentage calculation.
 * @internal
 */
export class PercentageFeeCalculator extends BaseEvmTransferFeeCalculator {
  constructor() {
    super();
  }
  /**
   * @category EvmFee
   * Returns fee for a transfer
   * originating from an EVM chain
   * @param {EvmFeeCalculationParams} params
   * @returns {Promise<EvmFee>}
   */
  async calculateFee(params: EvmFeeCalculationParams): Promise<EvmFee> {
    const {
      feeHandlerAddress,
      feeHandlerType,
      sender,
      sourceSygmaId,
      destinationSygmaId,
      resourceSygmaId,
      provider,
      depositData,
    } = params;

    if (feeHandlerType === FeeHandlerType.PERCENTAGE) {
      const percentageFeeHandlerContract = PercentageERC20FeeHandler__factory.connect(
        feeHandlerAddress,
        provider,
      );

      const calculatedFee = await percentageFeeHandlerContract.calculateFee(
        sender,
        sourceSygmaId,
        destinationSygmaId,
        resourceSygmaId,
        depositData ?? utils.formatBytes32String(''),
        utils.formatBytes32String(''),
      );

      const feeBounds = await percentageFeeHandlerContract._resourceIDToFeeBounds(resourceSygmaId);

      const feePercentage = (
        await percentageFeeHandlerContract._domainResourceIDToFee(
          destinationSygmaId,
          resourceSygmaId,
        )
      ).toNumber();

      const HUNDRED_PERCENT = await percentageFeeHandlerContract.HUNDRED_PERCENT();
      const percentage = feePercentage / HUNDRED_PERCENT;
      const [fee] = calculatedFee;

      return {
        fee: fee.toBigInt(),
        percentage,
        type: FeeHandlerType.PERCENTAGE,
        handlerAddress: feeHandlerAddress,
        minFee: feeBounds.lowerBound.toBigInt(),
        maxFee: feeBounds.upperBound.toBigInt(),
      };
    }

    if (this.nextHandler) {
      return this.nextHandler.calculateFee(params);
    }

    return super.calculateFee(params);
  }
}
