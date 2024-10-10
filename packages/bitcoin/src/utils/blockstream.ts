import { Environment } from '@buildwithsygma/core';

const TESTNET_BLOCKSTREAM_URL = 'https://blockstream.info/testnet/api';
const MAINNET_BLOCKSTREAM_URL = 'https://blockstream.info/api';

type FeeEstimates = Record<string, number>;

function getBlockStreamUrl(environment: Environment): string {
  switch (environment) {
    case Environment.MAINNET:
      return MAINNET_BLOCKSTREAM_URL;
    default:
      return TESTNET_BLOCKSTREAM_URL;
  }
}

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

/**
 * @category Bitcoin Helpers
 * @description Get fee estimates from blockstream API
 * @param blockConfirmations - number of confirmations
 * @returns {Promise<number>} - fee estimate
 */
export async function getFeeEstimates(
  environment: Environment,
  blockConfirmations: string,
): Promise<number> {
  try {
    const url = getBlockStreamUrl(environment);
    const response = await fetch(`${url}/fee-estimates`);

    const data = (await response.json()) as FeeEstimates;

    return data[blockConfirmations];
  } catch (error) {
    throw new Error('Failed to get fee estimates');
  }
}

/**
 * @category Bitcoin Helpers
 * @description Broadcast transaction to the network
 * @param txHex - raw hex string of the signed transaction
 * @returns {Promise<string>} - transaction id
 */
export async function broadcastTransaction(
  environment: Environment,
  txHex: string,
): Promise<string> {
  try {
    const url = getBlockStreamUrl(environment);
    const response = await fetch(`${url}/tx`, {
      method: 'POST',
      body: txHex,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    return await response.text();
  } catch (error) {
    throw new Error('Failed to broadcast transaction');
  }
}

/**
 * @category Bitcoin Helpers
 * @description Get UTXOs for a given address
 * @param address - bitcoin address
 * @returns {Promise<Utxo[]>} - array of UTXOs
 */
export const fetchUTXOS = async (environment: Environment, address: string): Promise<Utxo[]> => {
  try {
    const url = getBlockStreamUrl(environment);
    const response = await fetch(`${url}/address/${address}/utxo`);

    const data = (await response.json()) as Utxo[];

    return data;
  } catch (error) {
    throw new Error('Failed to get utxos');
  }
};

/**
 * @category Bitcoin Helpers
 * @description Process the UTXOs to get the required amount
 * @param amount - amount to spend on the transaction
 * @param utxo - array of UTXOs to process`
 * @returns {Utxo[]} - array of UTXOs
 */
export const processUtxos = (utxo: Utxo[], amount: number): Utxo[] => {
  const utoxCumSum = utxo.reduce<Array<{ cumSum: number; index: number }>>((acc, utxo, idx) => {
    if (acc.length === 0) {
      acc[idx] = { cumSum: utxo.value, index: idx };
      return acc;
    }
    acc[idx] = { cumSum: acc[idx - 1].cumSum + utxo.value, index: idx };
    return acc;
  }, []);

  const utxoPosition = utoxCumSum.findIndex(utxo => utxo.cumSum > amount);

  const dataToReturn = utxo.slice(0, utxoPosition + 1);
  return dataToReturn;
};
