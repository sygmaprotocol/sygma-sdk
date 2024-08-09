import { BaseTransfer, type BitcoinResource } from '@buildwithsygma/core';
import type { BitcoinConfig, Config } from '@buildwithsygma/core/types';
import type { BitcoinTransferParams } from 'types';

export class BitcoinTransfer extends BaseTransfer {
  protected amount: bigint;
  protected feeAmount: bigint;
  protected feeAddress: string;
  protected destinationAddress: string;

  constructor(params: BitcoinTransferParams, config: Config) {
    super(params, config);
    this.destinationAddress = params.destinationAddress;
    this.amount = params.amount;
    this.sourceDomain = config.getDomain(params.source);
    this.destinationDomain = config.getDomain(params.destination);

    this.feeAddress = (this.sourceDomain as BitcoinConfig).feeAddress;
    this.feeAmount = BigInt((this.resource as BitcoinResource).feeAmount!);
  }
}
