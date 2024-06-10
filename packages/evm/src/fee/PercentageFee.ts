import { FeeHandlerType } from '@buildwithsygma/core';
import { PercentageERC20FeeHandlerEVM__factory } from '@buildwithsygma/sygma-contracts';
import { utils } from 'ethers';

import type { EvmFee } from '../types.js';

import type { EvmFeeCalculationParams } from './types.js';
import { BaseEvmTransferFeeCalculator } from './types.js';

export class PercentageFeeCalculator extends BaseEvmTransferFeeCalculator {
  constructor() {
    super();
  }

  async calculateFee(params: EvmFeeCalculationParams): Promise<EvmFee> {
    const {
      feeHandlerAddress,
      feeHandlerType,
      sender,
      sourceSygmaId,
      destinationSygmaId,
      resourceSygmaId,
      provider,
      depositData
    } = params;

    if (feeHandlerType === FeeHandlerType.PERCENTAGE) {
      const percentageFeeHandlerContract = PercentageERC20FeeHandlerEVM__factory.connect(
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

      const feeBounds = await percentageFeeHandlerContract._resourceIDToFeeBounds(
        resourceSygmaId,
      );

      const feePercentage = (
        await percentageFeeHandlerContract._domainResourceIDToFee(
          destinationSygmaId,
          resourceSygmaId,
        )
      ).toNumber();

      const HUNDRED_PERCENT = await percentageFeeHandlerContract.HUNDRED_PERCENT()
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
