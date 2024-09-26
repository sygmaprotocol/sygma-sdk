import type { BaseTransferParams } from '@buildwithsygma/core';
import type { BIP32API } from 'bip32';
import type { Network, networks, Psbt } from 'bitcoinjs-lib';

export enum TypeOfAddress {
  P2WPKH = 'P2WPKH',
  P2TR = 'P2TR',
}

export type UTXOData = {
  utxoTxId: string;
  utxoAmount: bigint;
  utxoOutputIndex: number;
};

export type CreateInputData = {
  utxoData: UTXOData;
  publicKey: Buffer;
  network: networks.Network;
  typeOfAddress: TypeOfAddress;
};

export interface BitcoinTransferParams extends BaseTransferParams {
  destinationAddress: string;
  amount: bigint;
  utxoData: UTXOData[];
  publicKey: Buffer;
  typeOfAddress: TypeOfAddress;
  network: networks.Network;
  feeRate: bigint;
  changeAddress?: string;
  size: bigint;
}

export type CreatePsbtParams = Pick<
  BitcoinTransferParams,
  | 'source'
  | 'destination'
  | 'destinationAddress'
  | 'amount'
  | 'resource'
  | 'utxoData'
  | 'publicKey'
  | 'typeOfAddress'
  | 'network'
  | 'feeRate'
  | 'changeAddress'
  | 'size'
>;

export type BitcoinTransaction = Psbt;

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

export type PublicKeyParams = {
  bip32: BIP32API;
  mnemonic: string;
  derivationPath: string;
  network: Network;
  typeOfAddress: TypeOfAddress;
};
