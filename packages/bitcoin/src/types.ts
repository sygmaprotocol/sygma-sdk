import type { BitcoinResource, Domainlike, Environment } from '@buildwithsygma/core';
import type { networks, Psbt } from 'bitcoinjs-lib';

export enum TypeOfAddress {
  P2WPKH = 'P2WPKH',
  P2TR = 'P2TR',
}

export type BitcoinTransferParams = {
  environment?: Environment;
  source: Domainlike;
  destination: Domainlike;
  destinationAddress: string;
  amount: number;
  resource: BitcoinResource | string;
  utxoData: {
    utxoTxId: string;
    utxoAmount: number;
    utxoOutputIndex: number;
  };
  publicKey: Buffer;
  typeOfAddress: TypeOfAddress;
  network: networks.Network;
  feeRate: number;
  changeAddress?: string;
};

export type BitcoinTransferRequest = Psbt;

export type PaymentReturnData = {
  output: Buffer;
  address?: string;
};

export type BitcoinTransferInputData = {
  hash: string | Buffer;
  index: number;
  witnessUtxo: { value: number; script: Buffer };
  tapInternalKey?: Buffer;
};
