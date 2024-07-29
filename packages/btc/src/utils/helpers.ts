import type { networks, Payment, Signer } from 'bitcoinjs-lib';
import { payments, Psbt } from 'bitcoinjs-lib';

import { TypeOfAddress } from '../types.js';
import type {
  BaseTransferParams,
  BitcoinTransferInputData,
  BitcoinTransferRequest,
  PaymentReturnData,
} from '../types.js';

type InputData = {
  hash: string;
  index: number;
  witnessUtxo: { value: number; script: Buffer };
  tapInternalKey: Buffer;
};

type OutputData = { value: number; script: Buffer; address: string };

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
    const { output, address } = payments.p2tr({
      internalPubkey: publicKey,
      network,
    }) as PaymentReturnData;

    console.log('address', address, output.toString('hex'));

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

// TODO: this needs to be used first
export function calculateFee({
  psbt,
  feeRate,
  inputData,
  bridgeOutputData,
  valueOutputData,
  outputFeeData,
  signer,
}: {
  feeRate: number;
  psbt: Psbt;
  inputData: InputData;
  bridgeOutputData: Pick<OutputData, 'script' | 'value'>;
  valueOutputData: Pick<OutputData, 'address' | 'value'>;
  outputFeeData: Pick<OutputData, 'address' | 'value'>;
  signer: Signer;
}): number {
  psbt.addInput(inputData);
  psbt.addOutput(bridgeOutputData);
  psbt.addOutput(valueOutputData);
  psbt.addOutput(outputFeeData);
  psbt.signInput(0, signer);
  psbt.finalizeAllInputs();

  const tx = psbt.extractTransaction(true);

  const virtualSize = tx.virtualSize();

  return Math.round(virtualSize * feeRate);
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
  BaseTransferParams,
  'utxoData' | 'publicKey' | 'network' | 'typeOfAddress'
>): BitcoinTransferInputData {
  if (typeOfAddress !== TypeOfAddress.P2TR) {
    return {
      hash: utxoTxId as unknown as Buffer,
      index: utxoOutputIndex,
      witnessUtxo: {
        script: getScriptPubkey(typeOfAddress, publicKey, network).scriptPubKey,
        value: utxoAmount,
      },
    };
  }
  return {
    hash: utxoTxId,
    index: utxoOutputIndex,
    witnessUtxo: {
      script: getScriptPubkey(typeOfAddress, publicKey, network).scriptPubKey as unknown as Buffer,
      value: utxoAmount,
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
  params: BaseTransferParams,
  feeAddress: string,
  depositAddress: string,
  feeAmount: number,
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

  // TODO: to remove the address parameter being returned
  const psbt = new Psbt({ network: params.network });

  psbt.addInput(createInputData(params));

  // OP_RETURN output
  psbt.addOutput({
    script: encodeDepositAddress(params.destinationAddress, Number(params.destination))
      .output as unknown as Buffer,
    value: 0,
  });

  // just because there is no fee on testnet
  if (feeAmount) {
    psbt.addOutput({
      address: feeAddress,
      value: Number(feeAmount),
    });
  }

  const size = 303; // this is the size on testnet with fee handler
  const minerFee = Math.floor(params.feeRate * size);
  console.log('minerFee', minerFee);

  let amountToSpent; // TODO: this condition is temporary since there is no fee on testnet
  if (feeAmount) {
    amountToSpent = params.utxoData.utxoAmount - Number(feeAmount) - minerFee;
  } else {
    amountToSpent = params.utxoData.utxoAmount - minerFee;
  }

  if (amountToSpent < params.amount) {
    throw new Error('Not enough funds');
  }

  // Amount to bridge
  psbt.addOutput({
    address: depositAddress,
    value: params.amount,
  });

  if (params.changeAddress && amountToSpent > params.amount) {
    const change = amountToSpent - params.amount;

    psbt.addOutput({
      address: params.changeAddress,
      value: change,
    });
  }

  return psbt;
}
