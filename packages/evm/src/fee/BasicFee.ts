import { FeeHandlerType } from '@buildwithsygma/core';
import { BasicFeeHandler__factory } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';
import type { EvmFee } from '../types.js';
import type { EvmFeeCalculationParams } from './types.js';
import { BaseEvmTransferFeeCalculator } from './types.js';

export class BasicFeeCalculator extends BaseEvmTransferFeeCalculator {
  constructor() {
    super();
  }

  async calculateFee(params: EvmFeeCalculationParams): Promise<EvmFee> {
    if (params.feeHandlerType === FeeHandlerType.BASIC) {
      const BasicFeeHandlerInstance = BasicFeeHandler__factory.connect(
        params.feeHandlerAddress,
        params.provider,
      );

      const calculatedFee = await BasicFeeHandlerInstance.calculateFee(
        params.sender,
        params.sourceSygmaId,
        params.destinationSygmaId,
        params.resourceSygmaId,
        ethers.utils.formatBytes32String(''),
        ethers.utils.formatBytes32String(''),
      );

      const [fee] = calculatedFee;
      return {
        fee: fee.toBigInt(),
        type: FeeHandlerType.BASIC,
        handlerAddress: params.feeHandlerAddress,
      };
    }

    if (this.nextHandler) {
      return this.nextHandler.calculateFee(params);
    }

    return super.calculateFee(params);
  }
}
