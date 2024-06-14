/* eslint-disable @typescript-eslint/no-unused-vars */

type BitcoinTransferRequest = {
  destinationEvmAddress: string;
  btcAmount: number;
};

export function createUriEncodedUtxoRequest(): BaseTransfer {
  throw new Error("Method not implemented");
}

export abstract class BaseTransfer {
  constructor(transfer: BitcoinTransferRequest) {}

  getUriEncodedUtxoRequest(btcTransferRequest: BitcoinTransferRequest): string {
    throw new Error("Method not implemented");
  }

  getBTCTransferRequest(): BitcoinTransferRequest {
    throw new Error("Method not implemented");
  }
}
