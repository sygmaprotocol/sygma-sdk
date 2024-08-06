import type { FeeHandlerType } from '@buildwithsygma/core';
import type { ethers } from 'ethers';
import type { EvmFee } from 'types';

export interface EvmFeeCalculationParams {
  provider: ethers.providers.Provider;
  sender: string;
  sourceSygmaId: number;
  destinationSygmaId: number;
  resourceSygmaId: string;
  feeHandlerAddress: string;
  feeHandlerType: FeeHandlerType;
  depositData?: string;
}

export interface EvmTransferFeeCalculationHandler {
  calculateFee(params: EvmFeeCalculationParams): Promise<EvmFee>;
  setNextHandler(handler: EvmTransferFeeCalculationHandler): EvmTransferFeeCalculationHandler;
}

export abstract class BaseEvmTransferFeeCalculator implements EvmTransferFeeCalculationHandler {
  nextHandler: EvmTransferFeeCalculationHandler | undefined;

  setNextHandler(handler: EvmTransferFeeCalculationHandler): EvmTransferFeeCalculationHandler {
    this.nextHandler = handler;
    return this.nextHandler;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calculateFee(_params: EvmFeeCalculationParams): Promise<EvmFee> {
    throw new Error('Fee Calculation method not specified or undefined');
  }
}
