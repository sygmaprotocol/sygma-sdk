import type { networks, Payment } from 'bitcoinjs-lib';
import { payments, Psbt } from 'bitcoinjs-lib';

import { TypeOfAddress } from '../types.js';
import type {
  BitcoinTransferInputData,
  BitcoinTransferRequest,
  PaymentReturnData,
  UTXOData,
  CreateInputData,
  CreatePsbtParams,
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
}: CreateInputData): BitcoinTransferInputData {
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
 * Check if the amount to transfer is valid
 * @category Helpers
 * @param amount - amount to transfer
 * @param utxoData - UTXO data
 * @returns {boolean}
 */
const invalidAmount = (amount: bigint, utxoData: UTXOData[]): boolean => {
  return utxoData.reduce((acc, curr) => acc + curr.utxoAmount, BigInt(0)) < amount;
};

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
  params: CreatePsbtParams,
  feeAddress: string,
  depositAddress: string,
  feeAmount: bigint,
): BitcoinTransferRequest {
  if (!['P2WPKH', 'P2TR'].includes(params.typeOfAddress.toString())) {
    throw new Error('Unsuported address type');
  }

  if (params.utxoData.length === 0) {
    throw new Error('UTXO data is required');
  }

  if (invalidAmount(params.amount, params.utxoData)) {
    throw new Error('Not enough funds to spend from the UTXO');
  }

  const psbt = new Psbt({ network: params.network });

  if (params.utxoData.length !== 1) {
    params.utxoData.forEach(utxo => {
      psbt.addInput(
        createInputData({
          utxoData: utxo,
          publicKey: params.publicKey,
          network: params.network,
          typeOfAddress: params.typeOfAddress,
        }),
      );
    });
  } else {
    psbt.addInput(
      createInputData({
        utxoData: params.utxoData[0],
        publicKey: params.publicKey,
        network: params.network,
        typeOfAddress: params.typeOfAddress,
      }),
    );
  }

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

  const minerFee = Math.floor(Number(params.feeRate) * Number(params.size));

  let amountToSpent: number;
  if (params.utxoData.length !== 1) {
    amountToSpent =
      params.utxoData.reduce((acc, curr) => acc + Number(curr.utxoAmount), 0) -
      Number(feeAmount) -
      minerFee;
  } else {
    amountToSpent = Number(params.utxoData[0].utxoAmount) - Number(feeAmount) - minerFee;
  }

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
