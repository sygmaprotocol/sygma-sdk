import type { networks, Payment } from 'bitcoinjs-lib';
import { payments, Psbt } from 'bitcoinjs-lib';

import { TypeOfAddress } from '../types.js';
import type { BaseTransferParams, BitcoinTransferRequest, PaymentReturnData } from '../types.js';

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

function encodeDepositAddress(depositAddress: string, destinationDomainId: number): Payment {
  return payments.embed({
    data: [Buffer.from(`${depositAddress}_${destinationDomainId}`)],
  });
}

export function getPsbt(
  params: BaseTransferParams,
  feeAddress: string,
  depositAddress: string,
  feeAmount: number,
): BitcoinTransferRequest {
  console.log("params", params);
  if (!['P2WPKH', 'P2TR'].includes(params.typeOfAddress)) {
    throw new Error('Unsuported address type');
  }

  // TODO: to remove the address parameter being returned
  const { scriptPubKey } = getScriptPubkey(params.typeOfAddress, params.publicKey, params.network);

  const psbt = new Psbt({ network: params.network });

  let amountToSpent; // TODO: this condition is temporary since there is no fee on testnet
  if (feeAmount) {
    amountToSpent = params.utxoAmount - feeAmount - params.minerFee;
  } else {
    amountToSpent = params.utxoAmount - params.minerFee;
  }

  if (params.typeOfAddress !== TypeOfAddress.P2TR) {
    psbt.addInput({
      hash: params.utxoTxId,
      index: params.utxoOutputIndex,
      witnessUtxo: {
        script: scriptPubKey,
        value: params.utxoAmount,
      },
    });
  } else {
    psbt.addInput({
      hash: params.utxoTxId,
      index: params.utxoOutputIndex,
      witnessUtxo: {
        script: scriptPubKey as unknown as Buffer,
        value: params.utxoAmount,
      },
      tapInternalKey: params.publicKey,
    });
  }

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

  // Amount to bridge
  psbt.addOutput({
    address: depositAddress,
    value: params.amount,
  });

  if (params.changeAddress && amountToSpent > params.amount) {
    const change = amountToSpent - params.amount;

    psbt.addOutput({
      address: params.changeAddress,
      value: change
    });
  }

  return psbt;
}
