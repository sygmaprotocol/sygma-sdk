import { Config } from '@buildwithsygma/core';
import type { networks } from 'bitcoinjs-lib';
import type { BaseTransferParams, BitcoinTransferRequest, TypeOfAddress } from 'types';

import { BaseTransfer } from './base-transfer.js';
import { getPsbt } from './utils/index.js';

export async function createBitcoinFungibleTransfer(
  params: BaseTransferParams,
): Promise<BitcoinTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV || params.environment);
  return new BitcoinTransfer(params, config);
}

class BitcoinTransfer extends BaseTransfer {
  protected destinationAddress: string;
  protected amount: number;
  protected utxoTxId: string;
  protected utxoOutputIndex: number;
  protected utxoAmount: number;
  protected publicKey: Buffer;
  protected typeOfAddress: TypeOfAddress;
  protected minerFee: number;
  protected network: networks.Network;
  protected changeAddress?: string;

  constructor(transfer: BaseTransferParams, config: Config) {
    super(transfer, config);
    this.destinationAddress = transfer.destinationAddress;
    this.amount = transfer.amount;
    this.utxoTxId = transfer.utxoTxId;
    this.utxoOutputIndex = transfer.utxoOutputIndex;
    this.utxoAmount = transfer.utxoAmount;
    this.publicKey = transfer.publicKey;
    this.typeOfAddress = transfer.typeOfAddress;
    this.minerFee = transfer.minerFee;
    this.network = transfer.network;
    this.changeAddress = transfer.changeAddress;
  }

  getUriEncodedUtxoRequest(): string {
    const { address } = this.resource;
    return `bitcoin:${address}?amount=${this.amount}&message=${this.destinationAddress}`;
  }

  getTransferTransaction(): BitcoinTransferRequest {
    return getPsbt(
      {
        source: this.sourceDomain.caipId,
        destination: this.destinationDomain.id,
        destinationAddress: this.destinationAddress,
        amount: this.amount,
        resource: this.resource.resourceId,
        utxoTxId: this.utxoTxId,
        utxoAmount: this.utxoAmount,
        utxoOutputIndex: this.utxoOutputIndex,
        publicKey: this.publicKey,
        typeOfAddress: this.typeOfAddress,
        minerFee: this.minerFee,
        network: this.network,
        changeAddress: this.changeAddress,
      },
      this.feeAddress,
      this.resource.address,
      this.feeAmount,
    );
  }
}
