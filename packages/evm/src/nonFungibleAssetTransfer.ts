import type { EvmResource } from '@buildwithsygma/core';
import { Config, ResourceType } from '@buildwithsygma/core';
import {
  Bridge__factory,
  ERC721MinterBurnerPauser__factory,
} from '@buildwithsygma/sygma-contracts';
import type { PopulatedTransaction } from 'ethers';
import { providers } from 'ethers';

import { AssetTransfer } from './evmAssetTransfer.js';
import type { EvmFee, NonFungibleTransferParams, TransactionRequest } from './types.js';
import { createAssetDepositData } from './utils/assetTransferHelpers.js';
import { approve, isApproved } from './utils/index.js';
import { createTransactionRequest } from './utils/transaction.js';

class NonFungibleAssetTransfer extends AssetTransfer {
  protected tokenId: string;

  get transferTokenId(): string {
    return this.tokenId;
  }

  constructor(params: NonFungibleTransferParams, config: Config) {
    super(params, config);
    this.tokenId = params.tokenId;
  }

  /**
   * Returns encoded deposit
   * data
   * @returns {string}
   */
  protected getDepositData(): string {
    return createAssetDepositData({
      destination: this.destination,
      recipientAddress: this.recipientAddress,
      tokenId: this.tokenId,
    });
  }

  /**
   * Returns true if source account
   * has enough token balance to
   * complete the transfer
   * @param {EvmFee} fee Fee associated with transfer
   * @returns {Promise<boolean>}
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  protected async hasEnoughBalance(fee?: EvmFee): Promise<boolean> {
    const { address } = this.resource as EvmResource;
    const provider = new providers.Web3Provider(this.sourceNetworkProvider);
    const erc721 = ERC721MinterBurnerPauser__factory.connect(address, provider);
    const owner = await erc721.ownerOf(this.tokenId);
    return owner.toLowerCase() === this.sourceAddress.toLowerCase();
  }

  public setTokenId(tokenId: string): void {
    this.tokenId = tokenId;
  }

  public setResource(resource: EvmResource): void {
    if (resource.type !== ResourceType.NON_FUNGIBLE) {
      throw new Error('Unsupported Resource type.');
    }
    this.transferResource = resource;
  }

  public async getApprovalTransactions(): Promise<Array<TransactionRequest>> {
    const approvalTransactions: Array<PopulatedTransaction> = [];
    const provider = new providers.Web3Provider(this.sourceNetworkProvider);
    const sourceDomainConfig = this.config.getDomainConfig(this.source.caipId);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(this.resource.resourceId);

    const resource = this.resource as EvmResource;
    const { address } = resource;
    const tokenInstance = ERC721MinterBurnerPauser__factory.connect(address, provider);
    const isAlreadyApproved = await isApproved(tokenInstance, handlerAddress, Number(this.tokenId));

    if (!isAlreadyApproved) {
      approvalTransactions.push(await approve(tokenInstance, handlerAddress, this.tokenId));
    }

    return approvalTransactions.map(transaction => createTransactionRequest(transaction));
  }
}

export async function createNonFungibleAssetTransfer(
  params: NonFungibleTransferParams,
): Promise<NonFungibleAssetTransfer> {
  const config = new Config();
  await config.init(process.env.SYGMA_ENV);

  const transfer = new NonFungibleAssetTransfer(params, config);

  const isValidTransfer = await transfer.isValidTransfer();

  if (!isValidTransfer)
    throw new Error('Handler not registered, please check if this is a valid bridge route.');

  return transfer;
}
