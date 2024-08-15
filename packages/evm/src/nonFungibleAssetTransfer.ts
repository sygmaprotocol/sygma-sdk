import type { EvmResource } from '@buildwithsygma/core';
import { Config } from '@buildwithsygma/core';
import {
  Bridge__factory,
  ERC721MinterBurnerPauser__factory,
} from '@buildwithsygma/sygma-contracts';
import type { PopulatedTransaction } from 'ethers';
import { providers } from 'ethers';
import type { NonFungibleTransferParams, TransactionRequest } from 'types';

import { AssetTransfer } from './evmAssetTransfer.js';
import { createERCDepositData } from './utils/helpers.js';
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
    return createERCDepositData(BigInt(this.tokenId), this.recipient, this.destination.parachainId);
  }

  public setTokenId(tokenId: string): void {
    this.tokenId = tokenId;
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
