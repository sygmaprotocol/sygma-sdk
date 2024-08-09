import type { BitcoinResource } from '@buildwithsygma/core';
import { Config } from '@buildwithsygma/core';
import type { networks } from 'bitcoinjs-lib';
import type { BitcoinTransferParams, BitcoinTransferRequest, TypeOfAddress, UTXOData } from 'types';

import { BitcoinTransfer } from './bitcoinTransfer.js';
import { getPsbt } from './utils/index.js';

export async function createBitcoinFungibleTransfer(
  params: BitcoinTransferParams,
): Promise<BitcoinFungibleTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV || params.environment);
  return new BitcoinFungibleTransfer(params, config);
}

class BitcoinFungibleTransfer extends BitcoinTransfer {
  protected publicKey: Buffer;
  protected typeOfAddress: TypeOfAddress;
  protected network: networks.Network;
  protected changeAddress?: string;
  protected feeRate: bigint;
  protected utxoData: UTXOData[];
  protected size: bigint;
  protected destinationAddress: string;

  constructor(transfer: BitcoinTransferParams, config: Config) {
    super(transfer, config);
    this.destinationAddress = transfer.destinationAddress;
    this.amount = transfer.amount;
    this.publicKey = transfer.publicKey;
    this.typeOfAddress = transfer.typeOfAddress;
    this.network = transfer.network;
    this.changeAddress = transfer.changeAddress;
    this.feeRate = transfer.feeRate;
    this.utxoData = transfer.utxoData;
    this.size = transfer.size;
  }

  getTransferTransaction(): BitcoinTransferRequest {
    return getPsbt(
      {
        source: this.sourceDomain.caipId,
        destination: this.destinationDomain.id,
        destinationAddress: this.destinationAddress,
        amount: this.amount,
        resource: this.resource.resourceId,
        utxoData: this.utxoData,
        publicKey: this.publicKey,
        typeOfAddress: this.typeOfAddress,
        network: this.network,
        feeRate: this.feeRate,
        changeAddress: this.changeAddress,
        size: this.size,
      },
      this.feeAddress,
      (this.resource as BitcoinResource).address,
      this.feeAmount,
    );
  }
}
