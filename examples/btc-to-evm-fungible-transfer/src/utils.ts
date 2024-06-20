import { Signer, networks, crypto } from "bitcoinjs-lib";
import { ECPairAPI, TinySecp256k1Interface } from "ecpair";

// shortens the public key to 32 bytes
export function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33)
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey]),
  );
}

// Get the tweaked signer and returns also public key
export function getTweakedSigner(ECPair: ECPairAPI, tinysecp: TinySecp256k1Interface, network: networks.Network, privateKey: string): { tweakedSigner: Signer, publicKey: Buffer } {
  const keypair = ECPair.fromWIF(privateKey!, networks.testnet) as Signer;
  // @ts-ignore
  let privKey: Uint8Array = keypair.privateKey!;

  if (keypair.publicKey[0] === 3) {
    privKey = tinysecp.privateNegate(privKey);
  }

  const tweakedPrivateKey = tinysecp.privateAdd(
    privKey,
    tapTweakHash(toXOnly(keypair.publicKey), undefined),
  );

  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!');
  }

  return {
    tweakedSigner: ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
      network: networks.testnet,
    }), publicKey: keypair.publicKey
  };
}

export type Utxo = {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}

export async function getLastUtxo(blockstreamUrl: string, bitcoinAddress: string): Promise<Utxo> {
  try {
    const response = await fetch(`${blockstreamUrl}/address/${bitcoinAddress}/utxo`);

    const data = await response.json();

    if(data.length === 0) {
      throw new Error('No UTXO found');
    }

    return data[0] as Utxo;
  } catch (error) {
    throw error;
  }
}

export async function broadcastTransaction(blockstreamUrl: string, txHex: string): Promise<string> {
  try {
    const response = await fetch(`${blockstreamUrl}/tx`, {
      method: 'POST',
      body: txHex,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error('Failed to broadcast transaction');
  }
}