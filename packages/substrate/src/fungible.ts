import type { Domainlike, SubstrateResource } from '@buildwithsygma/core';
import {
  Config,
  FeeHandlerType,
  isValidAddressForNetwork,
  Network,
  ResourceType,
} from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { AccountData } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';

import { BaseTransfer } from './base-transfer.js';
import type { SubstrateFee } from './types.js';
import { deposit, getBasicFee, getFeeHandler, getPercentageFee } from './utils/index.js';

export type SubstrateAssetTransferRequest = {
  sourceDomain: Domainlike;
  destinationDomain: Domainlike;
  sourceNetworkProvider: ApiPromise;
  resource: string | SubstrateResource;
  amount: bigint;
  destinationAddress: string;
  senderAddress: string;
};

export async function createSubstrateFungibleAssetTransfer(
  transferRequestParams: SubstrateAssetTransferRequest,
): Promise<SubstrateFungibleAssetTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);

  return new SubstrateFungibleAssetTransfer(transferRequestParams, config);
}

class SubstrateFungibleAssetTransfer extends BaseTransfer {
  amount: bigint;
  destinationAddress: string = '';
  senderAddress: string;

  constructor(transfer: SubstrateAssetTransferRequest, config: Config) {
    super(transfer, config);
    this.amount = transfer.amount;
    this.senderAddress = transfer.senderAddress;

    if (isValidAddressForNetwork(transfer.destinationAddress, this.destinationDomain.type))
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
    if (isValidAddressForNetwork(destinationAddress, this.destinationDomain.type))
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

  async verifyBalance(): Promise<void> {
    const fee = await this.getFee();

    if (!isValidAddressForNetwork(this.senderAddress, Network.SUBSTRATE))
      throw new Error('Sender address is incorrect');

    if (new BN(this.amount.toString()).lt(fee.fee)) {
      throw new Error('Transfer amount should be higher than transfer fee');
    }

    const { data: balance } = (await this.sourceNetworkProvider.query.system.account(
      this.senderAddress,
    )) as unknown as {
      data: AccountData;
    };

    // TODO: clarify if we extract fee from amount or add on top of it
    const costs = new BN(this.amount.toString()).add(fee.fee);

    if (new BN(balance.free).lt(costs)) {
      throw new Error('Insufficient balance to perform the Transaction');
    }
  }

  /**
   * Returns the transaction to be signed by the user.
   * @dev potentially add optional param to override transaction params
   * @returns {Promise<SubmittableExtrinsic<'promise', SubmittableResult>>}
   */
  async getTransferTransaction(): Promise<SubmittableExtrinsic<'promise', SubmittableResult>> {
    if (this.resource.type !== ResourceType.FUNGIBLE) {
      throw new Error(`Resource type ${this.resource.type} not supported by asset transfer`);
    }

    await this.verifyBalance();

    return deposit(
      this.sourceNetworkProvider,
      this.resource.xcmMultiAssetId,
      this.amount.toString(),
      this.destinationDomain.id.toString(),
      this.destinationAddress,
    );
  }
}
