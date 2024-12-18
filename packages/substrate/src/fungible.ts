import type { BaseTransferParams, SubstrateResource } from '@buildwithsygma/core';
import {
  BaseTransfer,
  Config,
  Environment,
  FeeHandlerType,
  isValidAddressForNetwork,
  Network,
  ResourceType,
} from '@buildwithsygma/core';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { BN } from '@polkadot/util';

import type { SubstrateFee } from './types.js';
import {
  deposit,
  getAssetBalance,
  getBasicFee,
  getFeeHandler,
  getNativeTokenBalance,
  getPercentageFee,
} from './utils/index.js';

export interface SubstrateAssetTransferRequest extends BaseTransferParams {
  sourceAddress: string;
  sourceNetworkProvider: ApiPromise;
  amount: bigint;
  recipientAddress: string;
}

export async function createSubstrateFungibleAssetTransfer(
  transferRequestParams: SubstrateAssetTransferRequest,
): Promise<SubstrateFungibleAssetTransfer> {
  const config = new Config();
  await config.init(transferRequestParams.environment ?? Environment.MAINNET);

  return new SubstrateFungibleAssetTransfer(transferRequestParams, config);
}

class SubstrateFungibleAssetTransfer extends BaseTransfer {
  transferAmount: bigint;
  recipientAddress: string = '';
  sourceNetworkProvider: ApiPromise;

  constructor(transfer: SubstrateAssetTransferRequest, config: Config) {
    super(transfer, config);
    this.transferAmount = transfer.amount;
    this.sourceNetworkProvider = transfer.sourceNetworkProvider;
    const environment = transfer.environment ?? Environment.MAINNET;

    if (isValidAddressForNetwork(environment, transfer.recipientAddress, this.destination.type))
      this.recipientAddress = transfer.recipientAddress;
  }

  public getSourceNetworkProvider(): ApiPromise {
    return this.sourceNetworkProvider;
  }

  /**
   * Set the transfer amount.
   * @param {bigint} amount
   */
  setAmount(amount: bigint): void {
    this.transferAmount = amount;
  }

  /**
   * Set the destination address.
   * @param {string} destinationAddress
   */
  setDestinationAddress(destinationAddress: string): void {
    if (isValidAddressForNetwork(this.environment, destinationAddress, this.destination.type))
      this.recipientAddress = destinationAddress;
  }

  /**
   * Returns the fee based on the transfer amount.
   * @param {bigint} [amount]
   * @returns {Promise<SubstrateFee>}
   */
  async getFee(amount?: bigint): Promise<SubstrateFee> {
    if (amount) this.transferAmount = amount;

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
          details: { amount: this.transferAmount.toString(), recipient: this.recipientAddress },
          from: this.source,
          resource,
          sender: '',
          to: this.destination,
        });
      default:
        throw new Error('Unable to retrieve fee');
    }
  }

  async verifyBalance(): Promise<void> {
    const fee = await this.getFee();

    if (!isValidAddressForNetwork(this.environment, this.sourceAddress, Network.SUBSTRATE))
      throw new Error('Sender address is incorrect');

    // Native token balance check
    if ([FeeHandlerType.BASIC].includes(fee.type)) {
      const amountBigNumber = new BN(this.transferAmount.toString());
      const balance = await getNativeTokenBalance(this.sourceNetworkProvider, this.sourceAddress);

      if (new BN(balance.free).lt(amountBigNumber)) {
        throw new Error('Insufficient balance to perform the Transaction');
      }
    }

    // Transferable Token balance check
    if ([FeeHandlerType.PERCENTAGE].includes(fee.type)) {
      const substrateResource = this.resource as SubstrateResource;
      if (!substrateResource.assetID) throw new Error('Asset ID is empty for the current resource');

      const transferableTokenBalance = await getAssetBalance(
        this.sourceNetworkProvider,
        substrateResource.assetID,
        this.sourceAddress,
      );

      if (new BN(transferableTokenBalance.balance).lt(fee.fee)) {
        throw new Error('Insufficient asset balance to perform the Transaction');
      }
    }
  }

  /**
   * Returns the transaction to be signed by the user.
   * @dev potentially add optional param to override transaction params
   * @returns {Promise<SubmittableExtrinsic<'promise', SubmittableResult>>}
   */
  async getTransferTransaction(): Promise<SubmittableExtrinsic<'promise', SubmittableResult>> {
    const resource = this.resource as SubstrateResource;

    if (this.resource.type !== ResourceType.FUNGIBLE) {
      throw new Error(`Resource type ${this.resource.type} not supported by asset transfer`);
    }

    await this.verifyBalance();

    return deposit(
      this.environment,
      this.sourceNetworkProvider,
      resource.xcmMultiAssetId,
      this.transferAmount.toString(),
      this.destination.id.toString(),
      this.recipientAddress,
    );
  }
}
