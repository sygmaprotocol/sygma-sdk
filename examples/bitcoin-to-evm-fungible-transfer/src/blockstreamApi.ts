import { TypeOfAddress } from "@buildwithsygma/bitcoin";
import type { BitcoinTransferParams } from "@buildwithsygma/bitcoin";
import type { Network, Signer } from "bitcoinjs-lib";
import { payments, Psbt } from "bitcoinjs-lib";

type SizeCalculationParams = {
  utxoData: BitcoinTransferParams["utxoData"];
  network: Network;
  publicKey: Buffer;
  depositAddress: string;
  domainId: number;
  amount: bigint;
  feeValue: bigint;
  changeAddress: string;
  signer: Signer;
  typeOfAddress: TypeOfAddress;
};

/**
 * Ee calculate the size of the transaction by using a tx with zero fee => input amount == output amount
 * Correctnes of the data is not relevant here, we need to know what's the size is going to be for the amount of inputs passed and the 4 outputs (deposit, change, fee, encoded data) we use to relay the funds
 */
export const calculateSize = ({
  utxoData,
  network,
  publicKey,
  depositAddress,
  domainId,
  amount,
  feeValue,
  changeAddress,
  signer,
  typeOfAddress,
}: SizeCalculationParams): number => {
  const pstb = new Psbt({ network: network });

  const scriptPubKey: Buffer = (typeOfAddress !== TypeOfAddress.P2TR)
    ? payments.p2wpkh({ pubkey: publicKey, network: network }).output as Buffer
    : payments.p2tr({ internalPubkey: publicKey, network: network }).output as Buffer;

  utxoData.forEach((utxo) => {
    const input = {
      hash: utxo.utxoTxId,
      index: utxo.utxoOutputIndex,
      witnessUtxo: {
        value: Number(utxo.utxoAmount),
        script: scriptPubKey,
      },
    };

    if (typeOfAddress === TypeOfAddress.P2TR) {
      (input as any).tapInternalKey = publicKey;
    }

    pstb.addInput(input);
  });


  const outputs = [
    {
      script: payments.embed({
        data: [Buffer.from(`${depositAddress}_${domainId}`)],
      }).output as Buffer,
      value: 0,
    },
    {
      address: changeAddress,
      value: Number(amount),
    },
    {
      address: changeAddress,
      value: Number(feeValue),
    },
    {
      address: changeAddress,
      value: 0,
    }
  ];

  outputs.forEach(output => pstb.addOutput(output));

  pstb.signAllInputs(signer);
  pstb.finalizeAllInputs();
  return pstb.extractTransaction(true).virtualSize();
};
