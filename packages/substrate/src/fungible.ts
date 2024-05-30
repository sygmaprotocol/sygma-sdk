import type { Domainlike, Environment } from '@buildwithsygma/core';
import { Config, FeeHandlerType } from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import { BaseTransfer } from './base-transfer.js';
import type { Fungible, SubstrateResource, Transfer } from './types.js';
import { ResourceType } from './types.js';
import { getFeeHandler, getPercentageFee, getBasicFee, deposit } from './utils/index.js';

export type SubstrateFee = {
  fee: BN;
  type: FeeHandlerType;
};

/**
 * Return amount of liquidity tokens on resource handler
 * @param provider
 * @param resource
 */
export async function getLiquidity(
  provider: ApiPromise,
  resource: SubstrateResource,
): Promise<bigint> {
  const liquidity = await provider.query.liquidityPallet.liquidity(resource.xcmMultiAssetId);

  return BigInt(liquidity.toString());
}

type SubstrateAssetTransferRequest = {
  source: Domainlike;
  sourceNetworkProvider: ApiPromise;
  destination: Domainlike;
  resource: string | SubstrateResource;
  amount: bigint;
  destinationAddress: string;
  environment: Environment;
};

export async function createSubstrateFungibleAssetTransfer(
  transferRequest: SubstrateAssetTransferRequest,
): Promise<SubstrateFungibleAssetTransfer> {
  const config = new Config();
  await config.init(transferRequest.environment);

  const transfer = new SubstrateFungibleAssetTransfer(transferRequest, config);

  return transfer;
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createSubstrateFungibleAssetTransfer`
 */
class SubstrateFungibleAssetTransfer extends BaseTransfer {
  private sourceNetworkProvider: ApiPromise;
  private sourceDomain: Domainlike;
  private destinationDomain: Domainlike;
  private resource: SubstrateResource;
  private amount: bigint;
  private destinationAddress: string;
  private config: Config;

  constructor(transfer: SubstrateAssetTransferRequest, config: Config) {
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    this.sourceDomain = transfer.source;
    this.destinationDomain = transfer.destination;
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

  setDestinationDomain(destinationDomain: Domainlike): this {
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
  async getTransferTransaction(): Promise<SubmittableExtrinsic<'promise', SubmittableResult>> {
    const fee = await this.getFee();

    switch (this.resource.type) {
      case ResourceType.FUNGIBLE: {
        if (new BN(this.amount.toString()).lt(fee.fee)) {
          throw new Error('Transfer amount should be higher than transfer fee');
        }

        return deposit(
          this.config.environment,
          this.sourceNetworkProvider,
          this.resource.xcmMultiAssetId,
          this.amount.toString(),
          this.destinationDomain.id.toString(),
          this.destinationAddress,
        );
      }

      default:
        throw new Error(
          `Resource type ${
            this.resource.type
          } with ${fee.fee.toString()} not supported by asset transfer`,
        );
    }
  }
}
