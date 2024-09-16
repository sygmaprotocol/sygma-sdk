import type { BIP32API } from 'bip32';
import type { Network } from 'bitcoinjs-lib';

export enum TypeOfAddress {
  P2WPKH = 'P2WPKH',
  P2TR = 'P2TR',
}

export type PublicKeyParams = {
  bip32: BIP32API;
  mnemonic: string;
  derivationPath: string;
  network: Network;
  typeOfAddress: TypeOfAddress;
};
