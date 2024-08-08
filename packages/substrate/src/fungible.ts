import type { BaseTransferParams, SubstrateResource } from '@buildwithsygma/core';
import {
  Config,
  FeeHandlerType,
  isValidAddressForNetwork,
  BaseTransfer,
  ResourceType,
} from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import type { SubstrateFee } from './types.js';
import { deposit, getBasicFee, getFeeHandler, getPercentageFee } from './utils/index.js';

export interface SubstrateAssetTransferRequest extends BaseTransferParams {
  sourceNetworkProvider: ApiPromise;
  amount: bigint;
  destinationAddress: string;
}

export async function createSubstrateFungibleAssetTransfer(
  transferRequestParams: SubstrateAssetTransferRequest,
): Promise<SubstrateFungibleAssetTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);

  return new SubstrateFungibleAssetTransfer(transferRequestParams, config);
}

class SubstrateFungibleAssetTransfer extends BaseTransfer {
  amount: bigint;
  destinationAddress: string;
  sourceNetworkProvider: ApiPromise;

  constructor(transfer: SubstrateAssetTransferRequest, config: Config) {
    super(transfer, config);
    this.amount = transfer.amount;
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    this.destinationAddress = transfer.destinationAddress;

    if (isValidAddressForNetwork(transfer.destinationAddress, this.destination.type))
      this.destinationAddress = transfer.destinationAddress;
  }

  public getSourceNetworkProvider(): ApiPromise {
    return this.sourceNetworkProvider;
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
    if (isValidAddressForNetwork(destinationAddress, this.destination.type))
      this.destinationAddress = destinationAddress;
  }

  /**
   * Returns the fee based on the transfer amount.
   * @param {bigint} [amount]
   * @returns {Promise<SubstrateFee>}
   */
  async getFee(amount?: bigint): Promise<SubstrateFee> {
    if (amount) this.amount = amount;

    const resource = this.resource as SubstrateResource;

    const feeHandlerType = await getFeeHandler(
      this.sourceNetworkProvider,
      this.destination.id,
      resource.xcmMultiAssetId,
    );

    switch (feeHandlerType) {
      case FeeHandlerType.BASIC:
        return await getBasicFee(
          this.sourceNetworkProvider,
          this.destination.id,
          resource.xcmMultiAssetId,
        );
      case FeeHandlerType.PERCENTAGE:
        return await getPercentageFee(this.sourceNetworkProvider, {
          details: { amount: this.amount.toString(), recipient: this.destinationAddress },
          from: this.source,
          resource,
          sender: '',
          to: this.destination,
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
    const resource = this.resource as SubstrateResource;

    if (this.resource.type !== ResourceType.FUNGIBLE) {
      throw new Error(`Resource type ${this.resource.type} not supported by asset transfer`);
    }

    if (new BN(this.amount.toString()).lt(fee.fee)) {
      throw new Error('Transfer amount should be higher than transfer fee');
    }

    return deposit(
      this.sourceNetworkProvider,
      resource.xcmMultiAssetId,
      this.amount.toString(),
      this.destination.id.toString(),
      this.destinationAddress,
    );
  }
}
