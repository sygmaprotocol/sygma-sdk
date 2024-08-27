import { BaseTransfer, Config, Environment } from '@buildwithsygma/core';
import type { Config as TConfig, BitcoinResource, Domain } from '@buildwithsygma/core/types';
import type { networks } from 'bitcoinjs-lib';

import type {
  BitcoinTransferParams,
  BitcoinTransaction,
  TypeOfAddress,
  UTXOData,
} from './types.js';
import { getPsbt } from './utils/index.js';

export async function createBitcoinFungibleTransfer(
  params: BitcoinTransferParams,
): Promise<BitcoinFungibleTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV || Environment.MAINNET);
  return new BitcoinFungibleTransfer(params, config);
}

class BitcoinFungibleTransfer extends BaseTransfer {
  protected publicKey: Buffer;
  protected typeOfAddress: TypeOfAddress;
  protected network: networks.Network;
  protected changeAddress?: string;
  protected feeRate: bigint;
  protected utxoData: UTXOData[];
  protected size: bigint;
  protected destinationAddress: string;
  protected amount: bigint;
  protected sourceDomain: Domain;
  protected destinationDomain: Domain;
  protected feeAddress: string;
  protected feeAmount: bigint;

  constructor(transfer: BitcoinTransferParams, config: TConfig) {
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
    this.sourceDomain = config.getDomain(transfer.source);
    this.destinationDomain = config.getDomain(transfer.destination);

    this.feeAddress = this.sourceDomain.feeAddress as string;
    this.feeAmount = BigInt((this.resource as BitcoinResource).feeAmount!);
  }

  getTransferTransaction(): BitcoinTransaction {
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
