/* eslint-disable @typescript-eslint/no-unused-vars */

import { BitcoinResource } from "@buildwithsygma/core/src";
import { Config } from "@buildwithsygma/core/types";

type BitcoinTransferRequest = {
  destinationAddress: string;
  amount: bigint;
};

export function createTransferRequest(): BaseTransfer {
  throw new Error("Method not implemented");
}

export abstract class BaseTransfer {
  constructor(transfer: BitcoinTransferRequest, config: Config) {}

  private findResource(
    resources: BitcoinResource[],
    resourceIdentifier: string | BitcoinResource,
  ): BitcoinResource | undefined {
    throw new Error("Method not implemented");
  }

  /**
   * Set resource to be transferred.
   * @param {BitcoinResource} resource
   */
  setResource(resource: BitcoinResource): void {
    throw new Error("Method not implemented");
  }

  getUriEncodedUtxoRequest(btcTransferRequest: BitcoinTransferRequest): string {
    throw new Error("Method not implemented");
  }

  getBTCTransferRequest(): BitcoinTransferRequest {
    throw new Error("Method not implemented");
  }
}