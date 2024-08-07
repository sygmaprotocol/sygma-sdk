import type { FeeHandlerType } from '@buildwithsygma/core';
import type { ethers } from 'ethers';
import type { EvmFee } from 'types';

/**
 * Parameters that are required to
 * calculate fee for a Sygma transfer.
 */
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

  /**
   * @category EvmFee
   *
   * Calculate transfer fee
   * @param {EvmFeeCalculationParams} params
   * @returns {Promise<EvmFee>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calculateFee(_params: EvmFeeCalculationParams): Promise<EvmFee> {
    throw new Error('Fee Calculation method not specified or undefined');
  }
}
