import {
  Domainlike,
  Environment,
  LiquidityError,
  SubstrateConfig,
  SubstrateResource,
} from '@buildwithsygma/core';
import { Config, FeeHandlerType, ResourceType } from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import { BaseTransfer } from './base-transfer.js';
import type { Fungible, SubstrateFee, Transfer } from './types.js';
import { deposit, getBasicFee, getFeeHandler, getPercentageFee, getLiquidity } from './utils';

export type SubstrateAssetTransferRequest = {
  sourceDomain: Domainlike;
  destinationDomain: Domainlike;
  sourceNetworkProvider: ApiPromise;
  resource: string | SubstrateResource;
  amount: bigint;
  destinationAddress: string;
};

async function checkDestinationFungibleHandler(
  destinationDomain: SubstrateConfig,
  resourceId: string,
  amount: bigint,
  sourceNetworkProvider: ApiPromise,
): Promise<void> {
  const handlerAddress = destinationDomain.handlers.find(
    handler => handler.type === ResourceType.FUNGIBLE,
  )?.address;
  if (!handlerAddress) {
    throw new Error('No Fungible handler configured on destination domain');
  }

  const destinationResource = destinationDomain.resources.find(
    resource => resource.resourceId === resourceId,
  );
  const destinationHandlerBalance = await getLiquidity(
    sourceNetworkProvider,
    destinationResource as SubstrateResource,
    handlerAddress,
  );

  if (destinationHandlerBalance < amount) {
    throw new LiquidityError(destinationHandlerBalance);
  }
}

export async function createSubstrateFungibleAssetTransfer(
  transferRequestParams: SubstrateAssetTransferRequest,
): Promise<SubstrateFungibleAssetTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV as Environment);

  const transfer = new SubstrateFungibleAssetTransfer(transferRequestParams, config);

  const destinationDomain = config.getDomainConfig(transfer.destinationAddress) as SubstrateConfig;
  await checkDestinationFungibleHandler(
    destinationDomain,
    transfer.resource.resourceId,
    transfer.amount,
    transfer.sourceNetworkProvider,
  );

  if (!(await transfer.isValidTransfer()))
    throw new Error('Handler not registered, please check if this is a valid bridge route.');

  return transfer;
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createSubstrateFungibleAssetTransfer`
 */
export class SubstrateFungibleAssetTransfer extends BaseTransfer {
  amount: bigint;
  destinationAddress: string;

  constructor(transfer: SubstrateAssetTransferRequest, config: Config) {
    super(transfer, config);
    this.amount = transfer.amount;
    this.destinationAddress = transfer.destinationAddress;
  }

  setAmount(amount: bigint) {
    this.amount = amount;
  }

  setDestinationAddress(destinationAddress: string) {
    this.destinationAddress = destinationAddress;
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
