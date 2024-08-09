import { TypeOfAddress } from "@buildwithsygma/bitcoin";
import type { BitcoinTransferParams } from "@buildwithsygma/bitcoin";
import type { Network, Signer } from "bitcoinjs-lib";
import { payments, Psbt } from "bitcoinjs-lib";

type Utxo = {
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

type FeeEstimates = Record<string, number>;

const BLOCK_CONFIRMATION_INDEX = "5";

export async function getFeeEstimates(blockstreamUrl: string): Promise<number> {
  if (!blockstreamUrl) throw new Error("Blockstream url is required");
  try {
    const response = await fetch(`${blockstreamUrl}/fee-estimates`);

    const data = (await response.json()) as FeeEstimates;

    return data[BLOCK_CONFIRMATION_INDEX]; // fee for 5 blocks confirmation
  } catch (error) {
    throw new Error("Failed to get fee estimates");
  }
}

export async function broadcastTransaction(
  blockstreamUrl: string,
  txHex: string,
): Promise<string> {
  try {
    const response = await fetch(`${blockstreamUrl}/tx`, {
      method: "POST",
      body: txHex,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    return await response.text();
  } catch (error) {
    throw new Error("Failed to broadcast transaction");
  }
}

export const fetchUTXOS = async (
  address: string,
  blockstreamUrl: string,
): Promise<Utxo[]> => {
  try {
    const response = await fetch(`${blockstreamUrl}/address/${address}/utxo`);

    const data = (await response.json()) as Utxo[];

    return data;
  } catch (error) {
    throw new Error("Failed to get utxos");
  }
};

export const processUtxos = (utxo: Utxo[], amount: number): Utxo[] => {
  const utoxCumSum = utxo.reduce<Array<{ cumSum: number; index: number }>>(
    (acc, utxo, idx) => {
      if (acc.length === 0) {
        acc[idx] = { cumSum: utxo.value, index: idx };
        return acc;
      }
      acc[idx] = { cumSum: acc[idx - 1].cumSum + utxo.value, index: idx };
      return acc;
    },
    [],
  );

  const utxoPosition = utoxCumSum.findIndex((utxo) => utxo.cumSum > amount);

  const dataToReturn = utxo.slice(0, utxoPosition + 1);
  return dataToReturn;
};

/**
 * Ee calculate the size of the transaction by using a tx with zero fee => input amount == output amount
 * Correctnes of the data is not relevant here, we need to know what's the size is going to be for the amount of inputs passed and the 4 outputs (deposit, change, fee, encoded data) we use to relay the funds
 */
export const calculateSize = (
  utxoData: BitcoinTransferParams["utxoData"][],
  network: Network,
  publicKey: Buffer,
  depositAddress: string,
  domainId: number,
  amount: bigint,
  feeValue: bigint,
  changeAddress: string,
  signer: Signer,
  typeOfAddress: TypeOfAddress,
): number => {
  const pstb = new Psbt({ network: network });

  let scriptPubKey: Buffer;
  if (typeOfAddress !== TypeOfAddress.P2TR) {
    const { output } = payments.p2wpkh({
      pubkey: publicKey,
      network: network,
    }) as { output: Buffer };
    scriptPubKey = output;
  } else {
    const { output } = payments.p2tr({
      internalPubkey: publicKey,
      network: network,
    }) as { output: Buffer };
    scriptPubKey = output;
  }

  if (typeOfAddress === TypeOfAddress.P2TR) {
    utxoData.forEach((utxo) => {
      pstb.addInput({
        hash: utxo.utxoTxId,
        index: utxo.utxoOutputIndex,
        witnessUtxo: {
          value: Number(utxo.utxoAmount),
          script: scriptPubKey,
        },
        tapInternalKey: publicKey,
      });
    });
  } else {
    utxoData.forEach((utxo) => {
      pstb.addInput({
        hash: utxo.utxoTxId,
        index: utxo.utxoOutputIndex,
        witnessUtxo: {
          value: Number(utxo.utxoAmount),
          script: scriptPubKey,
        },
      });
    });
  }

  pstb.addOutput({
    script: payments.embed({
      data: [Buffer.from(`${depositAddress}_${domainId}`)],
    }).output as unknown as Buffer,
    value: 0,
  });

  pstb.addOutput({
    address: changeAddress,
    value: Number(amount),
  });

  pstb.addOutput({
    address: changeAddress,
    value: Number(feeValue),
  });

  pstb.addOutput({
    address: changeAddress,
    value: 0,
  });

  pstb.signAllInputs(signer);
  pstb.finalizeAllInputs();
  const vsize = pstb.extractTransaction(true).virtualSize();
  return vsize;
};
