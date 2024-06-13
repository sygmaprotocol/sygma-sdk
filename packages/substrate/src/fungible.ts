import type { Domainlike, SubstrateConfig, SubstrateResource } from '@buildwithsygma/core';
import { Config, FeeHandlerType, LiquidityError, ResourceType } from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import { BaseTransfer } from './base-transfer.js';
import type { SubstrateFee } from './types.js';
import {
  getBasicFee,
  getFeeHandler,
  getPercentageFee,
  getLiquidity,
  deposit,
} from './utils/index.js';

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
  await config.init(process.env.SYGMA_ENV);

  const transfer = new SubstrateFungibleAssetTransfer(transferRequestParams, config);
  const destinationDomain = config.getDomainConfig(transfer.destinationAddress) as SubstrateConfig;

  await checkDestinationFungibleHandler(
    destinationDomain,
    transfer.resource.resourceId,
    transfer.amount,
    transfer.sourceNetworkProvider,
  );

  return transfer;
}

export class SubstrateFungibleAssetTransfer extends BaseTransfer {
  amount: bigint;
  destinationAddress: string;

  constructor(transfer: SubstrateAssetTransferRequest, config: Config) {
    super(transfer, config);
    this.amount = transfer.amount;
    this.destinationAddress = transfer.destinationAddress;
  }

  /**
   * Set the transfer amount.
   * @param {bigint} amount
   */
  setAmount(amount: bigint): void {
    this.amount = amount;
  }

  /**
   * Set the destination address.
   * @param {string} destinationAddress
   */
  setDestinationAddress(destinationAddress: string): void {
    this.destinationAddress = destinationAddress;
  }

  /**
   * Returns the fee based on the transfer amount.
   * @param {bigint} [amount]
   * @returns {Promise<SubstrateFee>}
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
        return await getPercentageFee(this.sourceNetworkProvider, {
          details: { amount: this.amount.toString(), recipient: this.destinationAddress },
          from: this.sourceDomain,
          resource: this.resource,
          sender: '',
          to: this.destinationDomain,
        });
      default:
        throw new Error('Unable to retrieve fee');
    }
  }

  /**
   * Returns the transaction to be signed by the user.
   * @dev potentially add optional param to override transaction params
   * @returns {Promise<SubmittableExtrinsic<'promise', SubmittableResult>>}
   */
  async getTransferTransaction(): Promise<SubmittableExtrinsic<'promise', SubmittableResult>> {
    const fee = await this.getFee();

    if (this.resource.type !== ResourceType.FUNGIBLE) {
      throw new Error(`Resource type ${this.resource.type} not supported by asset transfer`);
    }

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
}
