/* eslint-disable @typescript-eslint/no-unused-vars */

type BitcoinTransferRequest = {
  destinationEvmAddress: string;
  btcAmount: number;
};

export function createUriEncodedUtxoRequest(): BitcoinFungibleAssetTransfer {
  throw new Error("Method not implemented");
}

export abstract class BitcoinFungibleAssetTransfer {
  constructor(transfer: BitcoinTransferRequest) {}

  getUriEncodedUtxoRequest(): string {
    throw new Error("Method not implemented");
  }

  getRawUtxoRequest(): string {
    throw new Error("Method not implemented");
  }
}
