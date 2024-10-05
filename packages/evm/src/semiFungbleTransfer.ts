import { Config } from '@buildwithsygma/core';
import type { EvmResource } from '@buildwithsygma/core';
import {
  ERC1155__factory,
  Bridge__factory,
  ERC721MinterBurnerPauser__factory,
} from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import type { ethers } from 'ethers';
import { providers } from 'ethers';

import { AssetTransfer } from './evmAssetTransfer.js';
import type { EvmAssetTransferParams, TransactionRequest } from './types.js';
import {
  createAssetDepositData,
  createTransactionRequest,
  getTransactionOverrides,
} from './utils/index.js';

/**
 *
 * ERC1155 - it supports ONLY NON-Fungible transfer so far
 *
 */
export class semiFungibleTransfer extends AssetTransfer {
  protected tokenId: string;
  protected specifiedAmount: bigint;

  constructor(params: EvmAssetTransferParams, config: Config) {
    super(params, config);

    // Ensure that the amount is always 1 for non-fungible tokens
    if (params.amount !== BigInt(1)) {
      throw new Error('Amount must be 1 for non-fungible ERC1155 tokens.');
    }
    if (!params.tokenId) {
      throw new Error('tokenId is required for ERC1155 non-fungible transfers.');
    }

    this.tokenId = params.tokenId;
    this.specifiedAmount = params.amount;
  }

  /**
   * Prepare the deposit data required for the ERC1155 transfer.
   */
  protected getDepositData(): string {
    return createAssetDepositData({
      destination: this.destination,
      recipientAddress: this.recipientAddress,
      tokenId: this.tokenId,
      amount: this.specifiedAmount,
    });
  }

  protected async hasEnoughBalance(): Promise<boolean> {
    const resource = this.resource as EvmResource;
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const erc1155 = ERC1155__factory.connect(resource.address, provider);
    const balance = await erc1155.balanceOf(this.sourceAddress, this.tokenId);
    return balance.gte(this.specifiedAmount);
  }

  protected async isOwner(): Promise<boolean> {
    const { address } = this.resource as EvmResource;
    const provider = new providers.Web3Provider(this.sourceNetworkProvider);
    const erc721 = ERC721MinterBurnerPauser__factory.connect(address, provider);
    const owner = await erc721.ownerOf(this.tokenId);
    return owner.toLowerCase() === this.sourceAddress.toLowerCase();
  }

  /**
   * Ensure that the bridge contract is approved to transfer the user's ERC1155 tokens.
   */
  public async getApprovalTransactions(
    overrides?: ethers.Overrides,
  ): Promise<Array<TransactionRequest>> {
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const domainConfig = this.config.getDomainConfig(this.source);
    const bridge = Bridge__factory.connect(domainConfig.bridge, provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.resourceId);

    const erc1155 = ERC1155__factory.connect((this.resource as EvmResource).address, provider);

    const isApproved = await erc1155.isApprovedForAll(this.sourceAddress, handlerAddress);
    const approvalTransactions: Array<TransactionRequest> = [];

    if (!isApproved) {
      const approvalTx = await erc1155.populateTransaction.setApprovalForAll(
        handlerAddress,
        true,
        overrides,
      );
      approvalTransactions.push(createTransactionRequest(approvalTx));
    }

    return approvalTransactions;
  }

  /**
   * Generate the transfer transaction for the ERC1155 token.
   */
  public async getTransferTransaction(overrides?: ethers.Overrides): Promise<TransactionRequest> {
    const domainConfig = this.config.getDomainConfig(this.source);
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(domainConfig.bridge, provider);
    const fee = await this.getFee();

    const isOwner = await this.isOwner();
    if (!isOwner) throw new Error('Source address is not an Owner of the token');

    const transferTransaction = await bridge.populateTransaction.deposit(
      this.destinationDomain.id.toString(),
      this.resource.resourceId,
      this.getDepositData(),
      '0x',
      getTransactionOverrides(fee, overrides),
    );

    return createTransactionRequest(transferTransaction);
  }
}

export async function createNonFungibleERC1155(
  params: EvmAssetTransferParams,
): Promise<semiFungibleTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);

  const transfer = new semiFungibleTransfer(params, config);

  const isValidTransfer = await transfer.isValidTransfer();

  if (!isValidTransfer) {
    throw new Error('Handler not registered, please check if this is a valid bridge route.');
  }

  return transfer;
}
