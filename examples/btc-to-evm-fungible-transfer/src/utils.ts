import { Signer, networks, crypto, Psbt } from "bitcoinjs-lib";
import { ECPairAPI, TinySecp256k1Interface } from "ecpair";

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
};

type InputData =  { hash: string, index: number, witnessUtxo: { value: number, script: Buffer }, tapInternalKey: Buffer }

type OutputData = { value: number, script: Buffer, address: string }


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

export async function getLastConfirmedUTXO(blockstreamUrl: string, bitcoinAddress: string): Promise<Utxo> {
  try {
    const response = await fetch(`${blockstreamUrl}/address/${bitcoinAddress}/utxo`);

    const data = await response.json();

    if (data.length === 0) {
      throw new Error('No UTXO found');
    }

    const confirmedUtxos = data.filter((utxo: Utxo) => utxo.status.confirmed);

    if (confirmedUtxos.length === 0) {
      throw new Error('No confirmed UTXO found');
    }

    return confirmedUtxos[0];
  } catch (error) {
    throw error;
  }
}

export async function getFeeEstimates(blockstreamUrl: string): Promise<number> {
  try {
    const response = await fetch(`${blockstreamUrl}/fee-estimates`);

    const data = await response.json();

    return data['5']; // fee for 5 blocks confirmation
  } catch (error) {
    throw new Error('Failed to get fee estimates');
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

export function calculateFee(psbt: Psbt, feeRate: number, inputData: InputData, bridgeOutputData: Pick<OutputData, "script" | "value">, valueOutputData: Pick<OutputData, "address" | "value">, tweakedSigner: Signer): number {
  psbt.addInput(inputData);
  psbt.addOutput(bridgeOutputData);
  psbt.addOutput(valueOutputData);

  psbt.signInput(0, tweakedSigner);
  psbt.finalizeAllInputs();

  const tx = psbt.extractTransaction(true);

  const virtualSize = tx.virtualSize();

  return Math.round(virtualSize * feeRate);
}