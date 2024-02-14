import type { PopulatedTransaction, UnsignedTransaction, providers } from 'ethers';
import { BigNumber, utils, constants } from 'ethers';

import type { ERC20, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import {
  Bridge__factory,
  ERC20__factory,
  ERC721MinterBurnerPauser__factory,
  FeeHandlerRouter__factory,
} from '@buildwithsygma/sygma-contracts';
import type {
  EthereumConfig,
  EvmResource,
  Fungible,
  NonFungible,
  Resource,
  Transfer,
  TransferType,
} from '../../types/index.js';
import { Environment, FeeHandlerType, ResourceType } from '../../types/index.js';
import { Config, getFeeHandlerAddress } from '../../index.js';
import { BaseAssetTransfer } from '../BaseAssetTransfer.js';
import type { EvmFee } from './index.js';
import {
  approve,
  calculateBasicfee,
  createERCDepositData,
  erc20Transfer,
  erc721Transfer,
  getERC20Allowance,
  getPercentageFee,
  isApproved,
} from './index.js';

/**
 * Class used for sending ERC20 and ERC721 transfers from EVM based chains.
 *
 *
 * @example
 * const provider = new ethers.providers.JsonRpcProvider('<rpc>');
 * const wallet = new Wallet(
 *  '<pk>',
 *  provider,
 * );
 * const assetTransfer = new EVMAssetTransfer();
 * await assetTransfer.init(provider);
 * const domains = assetTransfer.config.getDomains();
 * const resources = assetTransfer.config.getDomainResources();
 * const transfer: Transfer<Fungible> = {
 *  from: domains[0],
 *  to: domains[1],
 *  resource: resource[0],
 *  sender: await wallet.getAddress(),
 *  recipient: <recipient address>,
 *  amount: {
 *    amount: 200
 *  }
 * }
 * const fee = await assetTransfer.getFee(transfer);
 * const approvals = await assetTransfer.buildApprovals(transfer, fee);
 * const transferTx = await assetTransfer.buildTransferTransaction(transfer, fee);
 * for (const approval of approvals) {
 *  await wallet.sendTransaction(approval);
 * }
 * await wallet.sendTransaction(trasnferTx);
 *
 */
export class EVMAssetTransfer extends BaseAssetTransfer {
  private provider!: providers.BaseProvider;

  public async init(
    provider: providers.BaseProvider,
    environment: Environment = Environment.MAINNET,
  ): Promise<void> {
    this.provider = provider;
    const network = await this.provider.getNetwork();
    this.environment = environment;
    this.config = new Config();
    await this.config.init(network.chainId, environment);
  }

  /**
   * Calculates fee required for the requested transfer.
   * Fee can be paid in native currency or ERC20 token if the 'tokenAddress'
   * is defined.
   *
   * @param transfer instance of transfer
   * @returns fee that needs to paid
   */
  public async getFee(transfer: Transfer<TransferType>): Promise<EvmFee> {
    const { feeHandlerAddress, feeHandlerType } = await this.getFeeInformation(transfer);
    switch (feeHandlerType) {
      case FeeHandlerType.BASIC: {
        return await calculateBasicfee({
          basicFeeHandlerAddress: feeHandlerAddress,
          provider: this.provider,
          fromDomainID: transfer.from.id,
          toDomainID: transfer.to.id,
          resourceID: transfer.resource.resourceId,
          sender: transfer.sender,
        });
      }
      case FeeHandlerType.PERCENTAGE: {
        const fungibleTransfer = transfer as Transfer<Fungible>;
        return await getPercentageFee({
          precentageFeeHandlerAddress: feeHandlerAddress,
          provider: this.provider,
          sender: transfer.sender,
          fromDomainID: Number(transfer.from.id),
          toDomainID: Number(transfer.to.id),
          resourceID: transfer.resource.resourceId,
          depositData: createERCDepositData(
            fungibleTransfer.details.amount,
            fungibleTransfer.details.recipient,
            fungibleTransfer.details.parachainId,
          ),
        });
      }
      default:
        throw new Error(`Not able to get fee: unsupported fee handler type`);
    }
  }

  /**
   * Builds approval transactions that are required before executing
   * deposit. Returns multiple approvals if fee is payed in ERC20 token.
   *
   * @param {Transfer} transfer Transfer
   * @param {Fee} fee Fee calculated by 'getFee' function
   * @returns array of unsigned approval transaction
   */
  public async buildApprovals(
    transfer: Transfer<TransferType>,
    fee: EvmFee,
  ): Promise<Array<UnsignedTransaction>> {
    const bridge = Bridge__factory.connect(
      this.config.getSourceDomainConfig().bridge,
      this.provider,
    );
    const handlerAddress = await bridge._resourceIDToHandlerAddress(transfer.resource.resourceId);

    const approvals: Array<PopulatedTransaction> = [];
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        const erc20 = ERC20__factory.connect(
          (transfer.resource as EvmResource).address,
          this.provider,
        );
        approvals.push(
          ...(await this.getERC20Approvals(
            erc20,
            fee,
            transfer as Transfer<Fungible>,
            handlerAddress,
          )),
        );
        break;
      }
      case ResourceType.NON_FUNGIBLE: {
        const erc721 = ERC721MinterBurnerPauser__factory.connect(
          (transfer.resource as EvmResource).address,
          this.provider,
        );
        approvals.push(
          ...(await this.getERC721Approvals(
            erc721,
            transfer as Transfer<NonFungible>,
            handlerAddress,
          )),
        );
        break;
      }
      default:
        throw new Error(`Resource type not supported by asset transfer`);
    }

    return approvals;
  }

  /**
   * Builds an unsigned transfer transaction.
   * Should be executed after the approval transactions.
   *
   * @param {Transfer} transfer requested transfer
   * @param {Fee} fee Fee calculated by 'getFee' function
   * @param {Boolean} ignoreInsufficientDestinationLiquidity Flag to disable destination chain balance check
   * @returns unsigned transfer transaction
   * @throws {Error} Insufficient destination chain liquidity to proceed with transfer
   */
  public async buildTransferTransaction(
    transfer: Transfer<TransferType>,
    fee: EvmFee,
  ): Promise<PopulatedTransaction> {
    const bridge = Bridge__factory.connect(
      this.config.getSourceDomainConfig().bridge,
      this.provider,
    );
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        const fungibleTransfer = transfer as Transfer<Fungible>;
        return await erc20Transfer({
          amount: fungibleTransfer.details.amount,
          recipientAddress: fungibleTransfer.details.recipient,
          parachainId: fungibleTransfer.details.parachainId,
          bridgeInstance: bridge,
          domainId: transfer.to.id.toString(),
          resourceId: transfer.resource.resourceId,
          feeData: fee,
        });
      }
      case ResourceType.NON_FUNGIBLE: {
        const nonfungibleTransfer = transfer as Transfer<NonFungible>;
        return await erc721Transfer({
          id: nonfungibleTransfer.details.tokenId,
          recipientAddress: nonfungibleTransfer.details.recipient,
          parachainId: nonfungibleTransfer.details.parachainId,
          bridgeInstance: bridge,
          domainId: transfer.to.id.toString(),
          resourceId: transfer.resource.resourceId,
          feeData: fee,
        });
      }
      default:
        throw new Error(`Resource type not supported by asset transfer`);
    }
  }

  override async isRouteRegistered(
    destinationDomainID: string,
    resource: Resource,
  ): Promise<boolean> {
    const config = this.config.getSourceDomainConfig() as EthereumConfig;
    const registeredHandler = await getFeeHandlerAddress(
      this.provider,
      config.feeRouter,
      destinationDomainID,
      resource.resourceId,
    );
    return utils.isAddress(registeredHandler) && registeredHandler != constants.AddressZero;
  }

  private async getFeeInformation(
    transfer: Transfer<TransferType>,
  ): Promise<{ feeHandlerAddress: string; feeHandlerType: FeeHandlerType }> {
    const domainConfig = this.config.getSourceDomainConfig() as EthereumConfig;
    const feeRouter = FeeHandlerRouter__factory.connect(domainConfig.feeRouter, this.provider);
    const feeHandlerAddress = await feeRouter._domainResourceIDToFeeHandlerAddress(
      transfer.to.id,
      transfer.resource.resourceId,
    );

    if (!utils.isAddress(feeHandlerAddress) || feeHandlerAddress === constants.AddressZero) {
      throw new Error(`Failed getting fee: route not registered on fee handler`);
    }

    const feeHandlerConfig = domainConfig.feeHandlers.find(
      feeHandler => feeHandler.address == feeHandlerAddress,
    )!;
    if (!feeHandlerConfig) {
      throw new Error(`Failed getting fee: fee handler not registered on environment`);
    }

    return { feeHandlerAddress: feeHandlerAddress, feeHandlerType: feeHandlerConfig.type };
  }

  private async getERC20Approvals(
    erc20: ERC20,
    fee: EvmFee,
    transfer: Transfer<Fungible>,
    handlerAddress: string,
  ): Promise<Array<PopulatedTransaction>> {
    const approvals: Array<PopulatedTransaction> = [];
    if (
      fee.type == FeeHandlerType.PERCENTAGE &&
      (await getERC20Allowance(transfer.sender, erc20, fee.handlerAddress)).lt(fee.fee)
    ) {
      approvals.push(await approve(fee.fee.toString(), erc20, fee.handlerAddress));
    }

    const transferAmount = BigNumber.from(transfer.details.amount);
    if ((await getERC20Allowance(transfer.sender, erc20, handlerAddress)).lt(transferAmount)) {
      approvals.push(await approve(transferAmount.toString(), erc20, handlerAddress));
    }

    return approvals;
  }

  private async getERC721Approvals(
    erc721: ERC721MinterBurnerPauser,
    transfer: Transfer<NonFungible>,
    handlerAddress: string,
  ): Promise<Array<PopulatedTransaction>> {
    const approvals: Array<PopulatedTransaction> = [];
    if (!(await isApproved(Number(transfer.details.tokenId), erc721, handlerAddress))) {
      approvals.push(await approve(transfer.details.tokenId, erc721, handlerAddress));
    }

    return approvals;
  }
}
