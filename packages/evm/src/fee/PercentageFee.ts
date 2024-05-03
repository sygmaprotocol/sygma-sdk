import { PercentageERC20FeeHandlerEVM__factory } from '@buildwithsygma/sygma-contracts';
import { utils } from 'ethers';
import { FeeHandlerType } from '@buildwithsygma/core';
import type { EvmFee } from '../types.js';
import type { EvmFeeCalculationParams } from './types.js';
import { BaseEvmTransferFeeCalculator } from './types.js';

export class PercentageFeeCalculator extends BaseEvmTransferFeeCalculator {
  constructor() {
    super();
  }

  async calculateFee(params: EvmFeeCalculationParams): Promise<EvmFee> {
    if (params.feeHandlerType === FeeHandlerType.BASIC) {
      const percentageFeeHandlerContract = PercentageERC20FeeHandlerEVM__factory.connect(
        params.feeHandlerAddress,
        params.provider,
      );

      const calculatedFee = await percentageFeeHandlerContract.calculateFee(
        params.sender,
        params.sourceSygmaId,
        params.destinationSygmaId,
        params.resourceSygmaId,
        params.depositData ?? utils.formatBytes32String(''),
        utils.formatBytes32String(''),
      );

      const feeBounds = await percentageFeeHandlerContract._resourceIDToFeeBounds(
        params.resourceSygmaId,
      );

      const feePercentage = (
        await percentageFeeHandlerContract._domainResourceIDToFee(
          params.destinationSygmaId,
          params.resourceSygmaId,
        )
      ).toNumber();
      const percentage = feePercentage / (await percentageFeeHandlerContract.HUNDRED_PERCENT());
      const [fee] = calculatedFee;
      return {
        fee: fee.toBigInt(),
        percentage,
        type: FeeHandlerType.PERCENTAGE,
        handlerAddress: params.feeHandlerAddress,
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
