import type { BitcoinResource } from "@buildwithsygma/core/src";
import type { Network } from "bitcoinjs-lib";

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @description Bitcoin transaction input template
 * hash is the transaction hash of the previous unspent utxo
 * index is the index of the previous unspent utxo in the vout object of the transaction
 */
type BaseInputTemplate = {
  hash: string;
  index: number;
};

/**
 * @description Segwit input template to create bitcoin transaction
 * witness uses the script and value of the previous unspent utxo. We take the script from the hex attribute in the scriptPubKey object
 * script has to be hex encoded
 * value is the amount of satoshis in the previous unspent utxo
 */
type WitnessInputTemplate = BaseInputTemplate & {
  witness: {
    script: Buffer;
    value: number;
  };
};

/**
 * @description  output template to create bitcoin transaction
 * evmDestinationAddress is encoded EVM address of the receiver
 * resource is the bitcoin taproot address to send the transaction that will trigger briging the asset
 * value is either satoshis to send or 0 for the encoded data
 */
type BaseOutputTemplate = {
  evmDestinationAddress: string;
  resource: BitcoinResource;
  value: number;
};

/**
 * @description Non-segwit input template to create bitcoin transaction
 * nonWitnessUtxo is the raw transaction data of the previous unspent utxo hex encoded
 */
type NonWitnessInputTemplate = BaseInputTemplate & {
  nonWitnessUtxo: Buffer;
};

/**
 * @description KeyPair to sign the transaction
 * privateKey is the private key of the sender with unspent utxo. WIF format is expected
 * network is the network for which the transaction should be encoded.
 * We use bitcoinjs-lib network types
 */
type KeyPair = {
  privateKey: string;
  network: Network;
};

type BaseBitcoinTransferRequest = {
  output: BaseOutputTemplate;
  keypair: KeyPair;
};

/**
 * @description type for bitcoin witness transaction
 * keypair is used here to sing the transaction inputUtxo being used
 */
type BitcoinWitnessTransferRequest = BaseBitcoinTransferRequest & {
  inputUtxo: WitnessInputTemplate;
};

/**
 * @description type for bitcoin non-witness transaction (Legacy)
 * keypair is used here to sing the transaction inputUtxo being used
 */
type BitcoinNonWitnessTransferRequest = BaseBitcoinTransferRequest & {
  inputUtxo: NonWitnessInputTemplate;
};

export function createBitcoinWitnessFungibleTransfer(): BitcoinFungibleAssetTransfer {
  throw new Error("Method not implemented");
}

export function createBitcoinNonWitnessFungibleTransfer(): BitcoinFungibleAssetTransfer {
  throw new Error("Method not implemented");
}

export abstract class BitcoinFungibleAssetTransfer {
  constructor(
    transfer: BitcoinWitnessTransferRequest | BitcoinNonWitnessTransferRequest,
  ) {}

  setWitnessInput(input: WitnessInputTemplate): this {
    throw new Error("Method not implemented");
  }

  setWitnessOutput(output: BaseOutputTemplate): this {
    throw new Error("Method not implemented");
  }

  setNonWitnessInput(input: NonWitnessInputTemplate): this {
    throw new Error("Method not implemented");
  }

  setNonWitnessOutput(output: BaseOutputTemplate): this {
    throw new Error("Method not implemented");
  }

  setKeyPair(keypair: KeyPair): this {
    throw new Error("Method not implemented");
  }
}
