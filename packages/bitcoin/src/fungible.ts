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

  getUriEncodedUtxoRequest(btcTransferRequest: BitcoinTransferRequest): string {
    throw new Error("Method not implemented");
  }

  getBTCTransferRequest(): BitcoinTransferRequest {
    throw new Error("Method not implemented");
  }
}
