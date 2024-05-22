import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { BN } from '@polkadot/util';
import type { Config } from '@buildwithsygma/core/src';
import { getFeeHandler, getPercentageFee, getBasicFee } from './utils/index.js';
import type { Domain, Fungible, SubstrateResource, Transfer } from './types.js';
import { FeeHandlerType } from './types.js';

export type SubstrateFee = {
  fee: BN;
  type: FeeHandlerType;
};

/**
 * Return amount of liquidity tokens on resource handler
 * @param provider
 * @param resource
 */
export function getLiquidity(provider: ApiPromise, resource: SubstrateResource): Promise<bigint> {
  throw new Error('Method not implemented');
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
  throw new Error('Method not implemented');
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createSubstrateFungibleAssetTransfer`
 */
export abstract class SubstrateFungibleAssetTransfer {
  private sourceNetworkProvider: ApiPromise;
  private sourceDomain: Domain;
  private destinationDomain: Domain;
  private resource: SubstrateResource;
  private amount: bigint;
  private destinationAddress: string;
  private config: Config;

  protected constructor(
    transfer: {
      sourceDomain: Domain;
      sourceNetworkProvider: ApiPromise;
      destinationDomain: Domain;
      resource: SubstrateResource;
      amount: bigint;
      destinationAddress: string;
    },
    config: Config,
  ) {
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    this.sourceDomain = transfer.sourceDomain;
    this.destinationDomain = transfer.destinationDomain;
    this.resource = transfer.resource;
    this.amount = transfer.amount;
    this.destinationAddress = transfer.destinationAddress;
    this.config = config;
  }

  setAmount(amount: bigint): this {
    this.amount = amount;
    return this;
  }

  setResource(resource: SubstrateResource): this {
    this.resource = resource;
    return this;
  }

  setDestinationDomain(destinationDomain: Domain): this {
    this.destinationDomain = destinationDomain;
    return this;
  }

  setDestinationAddress(destinationAddress: string): this {
    this.destinationAddress = destinationAddress;
    return this;
  }

  /**
   * Returns fee based on transfer amount.
   * @param amount
   */
  async getFee(amount?: bigint): Promise<SubstrateFee> {
    if (amount) this.amount = amount;

    const feeHandlerType = await getFeeHandler(
      this.sourceNetworkProvider,
      this.destinationDomain.id,
      this.resource.xcmMultiAssetId,
    );

    switch (feeHandlerType) {
      case FeeHandlerType.BASIC:
        return await getBasicFee(
          this.sourceNetworkProvider,
          this.destinationDomain.id,
          this.resource.xcmMultiAssetId,
        );
      case FeeHandlerType.PERCENTAGE:
        return await getPercentageFee(this.sourceNetworkProvider, {} as Transfer<Fungible>);
      default:
        throw new Error('Unable to retrieve fee');
    }
  }

  /**
   * Returns transaction to be signed by the user
   * @dev potentially add optional param to override transaction params
   */
  getTransferTransaction(): Promise<SubmittableResult> {
    throw new Error('Method not implemented');
  }
}
