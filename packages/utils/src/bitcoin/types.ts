import type { TypeOfAddress } from '@buildwithsygma/bitcoin';
import type { BIP32API } from 'bip32';
import type { Network } from 'bitcoinjs-lib';

export type PublicKeyParams = {
  bip32: BIP32API;
  mnemonic: string;
  derivationPath: string;
  network: Network;
  typeOfAddress: TypeOfAddress;
};
