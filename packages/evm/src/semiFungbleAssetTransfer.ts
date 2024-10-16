import { Config, Environment, ResourceType } from '@buildwithsygma/core';
import type { EvmResource } from '@buildwithsygma/core';
import { ERC1155__factory, Bridge__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { constants, utils, type ethers } from 'ethers';

import { UnregisteredResourceHandlerError, UnsupportedResourceTypeError } from './errors.js';
import { EvmTransfer } from './evmTransfer.js';
import type { SemiFungibleTransferParams, TransactionRequest } from './types.js';
import {
  createERC1155DepositData,
  createTransactionRequest,
  getTransactionOverrides,
} from './utils/index.js';

/**
 *
 * ERC1155 - it supports ONLY NON-Fungible transfer so far
 *
 */
class SemiFungibleAssetTransfer extends EvmTransfer {
  protected tokenIds: string[];
  protected amounts: bigint[];
  protected recipientAdddress: string;

  constructor(params: SemiFungibleTransferParams, config: Config) {
    super(params, config);
    this.recipientAdddress = params.recipientAddress;
    this.tokenIds = params.tokenIds;
    this.amounts = params.amounts;
  }

  public setResource(resource: EvmResource): void {
    if (resource.type !== ResourceType.SEMI_FUNGIBLE) {
      throw new UnsupportedResourceTypeError(ResourceType.SEMI_FUNGIBLE, resource.type);
    }

    this.transferResource = resource;
  }

  /**
   * Prepare the deposit data required for the ERC1155 transfer.
   */
  protected getDepositData(): string {
    return createERC1155DepositData({
      destination: this.destination,
      recipientAddress: this.recipientAdddress,
      tokenIds: this.tokenIds,
      amounts: this.amounts,
    });
  }

  async isValidTransfer(): Promise<boolean> {
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const web3Provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, web3Provider);
    const { resourceId } = this.resource;
    const handlerAddress = await bridge._resourceIDToHandlerAddress(resourceId);
    return utils.isAddress(handlerAddress) && handlerAddress !== constants.AddressZero;
  }

  protected async hasEnoughBalance(): Promise<boolean> {
    const resource = this.resource as EvmResource;
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const erc1155 = ERC1155__factory.connect(resource.address, provider);

    let hasBalance = true;
    for (let i = 0; i < this.tokenIds.length; i++) {
      const balance = await erc1155.balanceOf(this.sourceAddress, this.tokenIds[i]);

      hasBalance = balance.gte(this.amounts[i]);
      if (!hasBalance) i += this.tokenIds.length;
    }

    return hasBalance;
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
        overrides ?? {},
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

export async function createSemiFungibleAssetTransfer(
  params: SemiFungibleTransferParams,
): Promise<SemiFungibleAssetTransfer> {
  const config = new Config();
  await config.init(params.environment ?? Environment.MAINNET);

  const transfer = new SemiFungibleAssetTransfer(params, config);
  const isValidTransfer = await transfer.isValidTransfer();
  if (!isValidTransfer) throw new UnregisteredResourceHandlerError(transfer.resource.resourceId);

  return transfer;
}
