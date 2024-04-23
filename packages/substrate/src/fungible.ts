/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Domain,
  FeeHandlerType,
  SubstrateResource,
} from "@buildwithsygma/sygma-sdk-core";
import type { ApiPromise, SubmittableResult } from "@polkadot/api";

export type SubstrateFee = {
  fee: bigint;
  type: FeeHandlerType;
};

/**
 * Return amount of liqudiity tokens on resource handler
 * @param provider
 * @param resource
 */
export function getLiquidity(
  provider: ApiPromise,
  resource: SubstrateResource,
): Promise<bigint> {
  throw new Error("Method not implemented");
}

type SubstrateAssetTransferRequest = {
  source: string | number | Domain;
  sourceNetworkProvider: ApiPromise;
  destination: string | number | Domain;
  resource: string | SubstrateResource;
  amount: bigint;
  destinationAddress: string;
};

export function createSubstrateFungibleAssetTransfer(
  transferRequest: SubstrateAssetTransferRequest,
): Promise<SubstrateFungibleAssetTransfer> {
  throw new Error("Method not implemented");
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createSubstrateFungibleAssetTransfer`
 */
export abstract class SubstrateFungibleAssetTransfer {
  constructor(transfer: {
    sourceDomain: string | number | Domain;
    sourceNetworkProvider: ApiPromise;
    destinationDomain: string | number | Domain;
    resource: string | SubstrateResource;
    amount: bigint;
    destinationAddress: string;
  }) {}

  setAmount(amount: bigint): this {
    throw new Error("Method not implemented");
  }
  setResource(resource: SubstrateResource): this {
    throw new Error("Method not implemented");
  }
  setDesinationDomain(destinationDomain: string | number | Domain): this {
    throw new Error("Method not implemented");
  }
  setDestinationAddress(destinationAddress: string): this {
    throw new Error("Method not implemented");
  }

  /**
   * Returns fee based on transfer amount.
   * @param amount By default it is original amount passed in constructor
   */
  getFee(amount?: bigint): Promise<SubstrateFee> {
    throw new Error("Method not implemented");
  }

  /**
   * Returns transaction to be signed by the user
   * @dev potentially add optional param to override transaction params
   */
  getTransferTransaction(): Promise<SubmittableResult> {
    throw new Error("Method not implemented");
  }
}
