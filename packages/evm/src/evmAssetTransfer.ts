import { Config, isValidAddressForNetwork } from '@buildwithsygma/core';
import { Bridge__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { constants, utils } from 'ethers';
import { EvmTransfer } from './evmTransfer.js';
import { EvmAssetTransferParams, TransactionRequest } from './types.js';
import { createTransactionRequest } from './utils/transaction.js';
import { assetTransfer } from './utils/index.js';

/**
 * Asset transfers in EVM
 * are of supported standards
 * like ERC20, ERC721 and ERC1155
 * which require set of approval and
 * transfer transactions
 * TODO: Add Support for all
 */
interface IAssetTransfer {
  getTransferTransaction(): Promise<TransactionRequest>;
  getApprovalTransactions(): Promise<Array<TransactionRequest>>;
}

/**
 *
 */
export abstract class AssetTransfer extends EvmTransfer implements IAssetTransfer {
  // amount in case if its a fungible transfer
  protected amount?: bigint;
  // tokenId in case if its a non fungible transfer
  protected tokenId?: string;
  // Recipient address, marked "!"
  // as it is initialized by a setter
  // in the constructor
  recipient!: string;

  // Recipient address
  get recipientAddress() {
    return this.recipient;
  }

  constructor(assetTransferParams: EvmAssetTransferParams, config: Config) {
    super(assetTransferParams, config);
    this.amount = assetTransferParams.amount;
    this.tokenId = assetTransferParams.tokenId;
    this.setRecipientAddress(assetTransferParams.recipientAddress);
  }

  public getApprovalTransactions(): Promise<Array<TransactionRequest>> {
    throw new Error('Method not implemented.');
  }

  /**
   * Get transfer transaction
   * @returns {Promise<TransactionRequest>}
   */
  public async getTransferTransaction(): Promise<TransactionRequest> {
    const domainConfig = this.config.getDomainConfig(this.source);
    const provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(domainConfig.bridge, provider);
    const fee = await this.getFee();

    const transferTx = await assetTransfer({
      depositData: this.getDepositData(),
      bridgeInstance: bridge,
      domainId: this.destination.id.toString(),
      resourceId: this.resource.resourceId,
      feeData: fee,
    });

    return createTransactionRequest(transferTx);
  }

  /**
   * Set recipient address
   * @param {string} address
   */
  public setRecipientAddress(address: string): void {
    if (isValidAddressForNetwork(address, this.destination.type)) this.recipient = address;
  }

  /**
   * Checks whether the
   * resource is registered
   * within Sygma protocol
   * @returns {Promise<boolean>}
   */
  public async isValidTransfer(): Promise<boolean> {
    const sourceDomainConfig = this.config.getDomainConfig(this.source);
    const web3Provider = new Web3Provider(this.sourceNetworkProvider);
    const bridge = Bridge__factory.connect(sourceDomainConfig.bridge, web3Provider);
    const { resourceId } = this.resource;
    const handlerAddress = await bridge._resourceIDToHandlerAddress(resourceId);
    return utils.isAddress(handlerAddress) && handlerAddress !== constants.AddressZero;
  }
}
