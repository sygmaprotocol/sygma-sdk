import type { BitcoinResource, Domainlike, Environment } from '@buildwithsygma/core';
import type { networks, Psbt } from 'bitcoinjs-lib';

export enum TypeOfAddress {
  P2WPKH = 'P2WPKH',
  P2TR = 'P2TR',
}

export type BaseTransferParams = {
  environment?: Environment;
  source: Domainlike;
  destination: Domainlike;
  destinationAddress: string;
  amount: number;
  resource: BitcoinResource | string;
  utxoTxId: string;
  utxoAmount: number;
  utxoOutputIndex: number;
  publicKey: Buffer;
  typeOfAddress: TypeOfAddress;
  minerFee: number;
  network: networks.Network;
  changeAddress?: string;
};

export type BitcoinTransferRequest = Psbt;

export type PaymentReturnData = {
  output: Buffer;
};
