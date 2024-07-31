import type { networks, Payment } from 'bitcoinjs-lib';
import { payments, Psbt } from 'bitcoinjs-lib';

import { TypeOfAddress } from '../types.js';
import type {
  BitcoinTransferParams,
  BitcoinTransferInputData,
  BitcoinTransferRequest,
  PaymentReturnData,
} from '../types.js';

/**
 * Get the scriptPubKey for the given public key and network
 *
 * @category Helpers
 * @param typeOfAddress - type of address to use: currently p2wpkh or p2tr
 * @param publicKey - public of the signer
 * @param network - network to use
 * @returns {scriptPubKey: Buffer}
 */
export function getScriptPubkey(
  typeOfAddress: TypeOfAddress,
  publicKey: Buffer,
  network: networks.Network,
): {
  scriptPubKey: Buffer;
} {
  if (typeOfAddress === TypeOfAddress.P2WPKH) {
    const { output } = payments.p2wpkh({
      pubkey: publicKey,
      network,
    }) as PaymentReturnData;

    return { scriptPubKey: output };
  } else {
    const { output } = payments.p2tr({
      internalPubkey: publicKey,
      network,
    }) as PaymentReturnData;

    return { scriptPubKey: output };
  }
}

/**
 * Encode the deposit address and the domain id to pass into the OP_RETURN output
 *
 * @category Helpers
 * @param depositAddress - address to deposit
 * @param destinationDomainId - destination domain id
 * @returns {Payment}
 */
function encodeDepositAddress(depositAddress: string, destinationDomainId: number): Payment {
  return payments.embed({
    data: [Buffer.from(`${depositAddress}_${destinationDomainId}`)],
  });
}

/**
 * Create the input data for the PSBT
 *
 * @category Helpers
 * @param utxoData - UTXO data
 * @param publicKey - public key of the signer
 * @param network - network to use
 * @param typeOfAddress - type of address to use
 * @returns {BitcoinTransferInputData}
 */
export function createInputData({
  utxoData: { utxoTxId, utxoOutputIndex, utxoAmount },
  publicKey,
  network,
  typeOfAddress,
}: Pick<
  BitcoinTransferParams,
  'utxoData' | 'publicKey' | 'network' | 'typeOfAddress'
>): BitcoinTransferInputData {
  if (typeOfAddress !== TypeOfAddress.P2TR) {
    return {
      hash: utxoTxId as unknown as Buffer,
      index: utxoOutputIndex,
      witnessUtxo: {
        script: getScriptPubkey(typeOfAddress, publicKey, network).scriptPubKey,
        value: Number(utxoAmount),
      },
    };
  }
  return {
    hash: utxoTxId,
    index: utxoOutputIndex,
    witnessUtxo: {
      script: getScriptPubkey(typeOfAddress, publicKey, network).scriptPubKey as unknown as Buffer,
      value: Number(utxoAmount),
    },
    tapInternalKey: publicKey,
  };
}

/**
 * Create the PSBT for the transfer using the input data supplied and adding the ouputs to use for the transaction
 *
 * @category Helpers
 * @param params - params to create the PSBT
 * @param feeAddress - fee handler address on BTC
 * @param depositAddress - bridge address on BTC
 * @param feeAmount - fee amount to be paid
 * @returns {BitcoinTransferRequest}
 */
export function getPsbt(
  params: BitcoinTransferParams,
  feeAddress: string,
  depositAddress: string,
  feeAmount: bigint,
): BitcoinTransferRequest {
  if (!['P2WPKH', 'P2TR'].includes(params.typeOfAddress.toString())) {
    throw new Error('Unsuported address type');
  }

  if (Object.keys(params.utxoData).length !== 3) {
    throw new Error('UTXO data is required');
  }

  if (params.amount > params.utxoData.utxoAmount) {
    throw new Error('Not enough funds to spend from the UTXO');
  }

  const psbt = new Psbt({ network: params.network });

  psbt.addInput(createInputData(params));

  // OP_RETURN output
  psbt.addOutput({
    script: encodeDepositAddress(params.destinationAddress, Number(params.destination))
      .output as unknown as Buffer,
    value: 0,
  });

  // Fee output
  psbt.addOutput({
    address: feeAddress,
    value: Number(feeAmount),
  });

  const size = 303;
  const minerFee = Math.floor(Number(params.feeRate) * size);

  const amountToSpent = Number(params.utxoData.utxoAmount) - Number(feeAmount) - minerFee;

  if (amountToSpent < params.amount) {
    throw new Error('Not enough funds');
  }

  // Amount to bridge
  psbt.addOutput({
    address: depositAddress,
    value: Number(params.amount),
  });

  if (params.changeAddress && amountToSpent > params.amount) {
    const change = Number(amountToSpent) - Number(params.amount);

    psbt.addOutput({
      address: params.changeAddress,
      value: change,
    });
  }

  return psbt;
}
