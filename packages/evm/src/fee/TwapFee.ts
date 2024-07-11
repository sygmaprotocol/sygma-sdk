import { FeeHandlerType } from '@buildwithsygma/core';
import { TwapGenericFeeHandler__factory } from '@buildwithsygma/sygma-contracts';
import { utils } from 'ethers';

import type { EvmFee } from '../types.js';

import { BaseEvmTransferFeeCalculator } from './types.js';
import type { EvmFeeCalculationParams } from './types.js';

export class TwapFeeCalculator extends BaseEvmTransferFeeCalculator {
  constructor() {
    super();
  }

  async calculateFee(_params: EvmFeeCalculationParams): Promise<EvmFee> {
    if (_params.feeHandlerType === FeeHandlerType.TWAP) {
      const TwapGenericFeeHandler = TwapGenericFeeHandler__factory.connect(
        _params.feeHandlerAddress,
        _params.provider,
      );

      const feeData = await TwapGenericFeeHandler.calculateFee(
        _params.sender,
        _params.sourceSygmaId,
        _params.destinationSygmaId,
        _params.resourceSygmaId,
        _params.depositData ?? utils.formatBytes32String(''),
        utils.formatBytes32String(''),
      );

      return {
        fee: BigInt(feeData[0].toString()),
        type: FeeHandlerType.TWAP,
        handlerAddress: _params.feeHandlerAddress,
      };
    }

    return super.calculateFee(_params);
  }
}
