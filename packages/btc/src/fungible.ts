import { Config } from '@buildwithsygma/core';
import type { BaseTransferParams, BitcoinTransferRequest } from 'types';

import { BaseTransfer } from './base-transfer.js';

export async function createBitcoinFungibleTransfer(
  params: BaseTransferParams,
): Promise<BitcoinTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);
  const transfer = new BitcoinTransfer(params, config);

  return transfer;
}

class BitcoinTransfer extends BaseTransfer {
  protected destinationAddress: string;
  protected amount: bigint;

  constructor(transfer: BaseTransferParams, config: Config) {
    super(transfer, config);
    this.destinationAddress = transfer.destinationAddress;
    this.amount = transfer.amount;
  }

  getUriEncodedUtxoRequest(): string {
    const { address } = this.resource;
    return `bitcoin:${address}?amount=${this.amount}&destinationAddress=${this.destinationAddress}`;
  }

  getBTCTransferRequest(): BitcoinTransferRequest {
    return {
      destinationAddress: this.destinationAddress,
      amount: this.amount,
      depositAddress: this.resource.address,
    };
  }
}
