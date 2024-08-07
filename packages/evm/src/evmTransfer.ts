import type { BaseTransferParams, Config, Eip1193Provider } from '@buildwithsygma/core';
import { BaseTransfer } from '@buildwithsygma/core';
import { providers } from 'ethers';

import { TwapFeeCalculator } from './fee/TwapFee.js';
import { getFeeInformation, BasicFeeCalculator, PercentageFeeCalculator } from './fee/index.js';
import type { EvmFee } from './types.js';

export interface EvmTransferParams extends BaseTransferParams {
  sourceNetworkProvider: Eip1193Provider;
}

export class EvmTransfer extends BaseTransfer {
  sourceNetworkProvider: Eip1193Provider;

  constructor(params: EvmTransferParams, config: Config) {
    super(params, config);
    this.sourceNetworkProvider = params.sourceNetworkProvider;
  }

  protected getDepositData(): string {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns fee based on transfer amount.
   * @param amount By default it is original amount passed in constructor
   */
  async getFee(): Promise<EvmFee> {
    const provider = new providers.Web3Provider(this.sourceNetworkProvider);

    const { feeHandlerAddress, feeHandlerType } = await getFeeInformation(
      this.config,
      provider,
      this.source.id,
      this.destination.id,
      this.resource.resourceId,
    );

    const basicFeeCalculator = new BasicFeeCalculator();
    const percentageFeeCalculator = new PercentageFeeCalculator();
    const twapFeeCalculator = new TwapFeeCalculator();

    basicFeeCalculator.setNextHandler(percentageFeeCalculator).setNextHandler(twapFeeCalculator);

    return await basicFeeCalculator.calculateFee({
      provider,
      sender: this.sourceAddress,
      sourceSygmaId: this.source.id,
      destinationSygmaId: this.destination.id,
      resourceSygmaId: this.resource.resourceId,
      feeHandlerAddress,
      feeHandlerType,
    });
  }
}
