/* eslint-disable @typescript-eslint/no-unused-vars */

import type { BitcoinResource } from "@buildwithsygma/core/src";
import type { Config } from "@buildwithsygma/core/types";

type BaseTransferParams = {
  destinationAddress: string;
  amount: bigint;
};

type BitcoinTransferRequest = {
  destinationAddress: string;
  amount: bigint;
  depositAddress: string;
};

export function createBitcoinTransferRequest(
  params: BaseTransferParams,
): Promise<BaseTransfer> {
  throw new Error("Method not implemented");
}

export abstract class BaseTransfer {
  constructor(transfer: BaseTransferParams, config: Config) {}

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

  getUriEncodedUtxoRequest(btcTransferRequest: BaseTransferParams): string {
    throw new Error("Method not implemented");
  }

  getBTCTransferRequest(): BitcoinTransferRequest {
    throw new Error("Method not implemented");
  }
}
