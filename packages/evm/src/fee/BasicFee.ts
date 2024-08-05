import { FeeHandlerType } from '@buildwithsygma/core';
import { BasicFeeHandler__factory } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';

import type { EvmFee } from '../types.js';

import type { EvmFeeCalculationParams } from './types.js';
import { BaseEvmTransferFeeCalculator } from './types.js';
/**
 * @internal
 * @category EVM Fee
 *
 *
 * Wrapper class to calculate
 * fee for a route that uses
 * basic calculation.
 */
export class BasicFeeCalculator extends BaseEvmTransferFeeCalculator {
  constructor() {
    super();
  }
  /**
   * @category EvmFee
   *
   * Calculate transfer fee
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
    } = params;

    if (feeHandlerType === FeeHandlerType.BASIC) {
      const BasicFeeHandlerInstance = BasicFeeHandler__factory.connect(feeHandlerAddress, provider);

      const calculatedFee = await BasicFeeHandlerInstance.calculateFee(
        sender,
        sourceSygmaId,
        destinationSygmaId,
        resourceSygmaId,
        ethers.utils.formatBytes32String(''),
        ethers.utils.formatBytes32String(''),
      );

      const [fee] = calculatedFee;

      return {
        fee: fee.toBigInt(),
        type: FeeHandlerType.BASIC,
        handlerAddress: feeHandlerAddress,
      };
    }

    if (this.nextHandler) {
      return this.nextHandler.calculateFee(params);
    }

    return super.calculateFee(params);
  }
}
