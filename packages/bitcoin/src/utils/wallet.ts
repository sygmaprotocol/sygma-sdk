import { mnemonicToSeed } from 'bip39';
import { crypto } from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';

import { TypeOfAddress } from '../types.js';
import type { GetPublicKeyResult, PublicKeyParams } from '../types.js';

/**
 * @category Bitcoin Wallet Helpers
 * @description Return either tweakedSigner and publicKeyDropedDERHeader or derivedNode to sign a transaction
 * @param {PublicKeyParams} - bip32, mnemonic, derivationPath, network, typeOfAddress
 * @returns {Promise<GetPublicKeyResult>}
 */
export const getPublicKey = async ({
  bip32,
  mnemonic,
  derivationPath,
  network,
  typeOfAddress,
}: PublicKeyParams): Promise<GetPublicKeyResult> => {
  const seed = await mnemonicToSeed(mnemonic);
  const rootKey = bip32.fromSeed(seed, network);
  const derivedNode = rootKey.derivePath(derivationPath);

  if (typeOfAddress === TypeOfAddress.P2TR) {
    const publicKeyDropedDERHeader = toXOnly(derivedNode.publicKey);

    const tweakedSigner = derivedNode.tweak(
      crypto.taggedHash('TapTweak', publicKeyDropedDERHeader),
    );

    return { tweakedSigner, publicKeyDropedDERHeader };
  }

  return { derivedNode };
};
