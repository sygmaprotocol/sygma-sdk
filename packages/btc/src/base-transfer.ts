/* eslint-disable @typescript-eslint/no-unused-vars */

type BitcoinTransferRequest = {
  destinationAddress: string;
  amount: bigint;
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