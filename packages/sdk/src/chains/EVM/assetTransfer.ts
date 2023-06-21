import { BigNumber, PopulatedTransaction, UnsignedTransaction, providers } from 'ethers';

import {
  Bridge__factory,
  ERC20,
  ERC20__factory,
  ERC721MinterBurnerPauser,
  ERC721MinterBurnerPauser__factory,
  FeeHandlerRouter__factory,
} from '@buildwithsygma/sygma-contracts';

import {
  Environment,
  EthereumConfig,
  EvmResource,
  FeeHandlerType,
  Fungible,
  NonFungible,
  ResourceType,
  Transfer,
  TransferType,
} from '../../types';
import { Config } from '../..';
import { getFeeOracleBaseURL } from '../../utils';
import { BaseAssetTransfer } from '../BaseAssetTransfer';
import {
  EvmFee,
  approve,
  calculateBasicfee,
  calculateDynamicFee,
  erc20Transfer,
  erc721Transfer,
  getERC20Allowance,
  isApproved,
} from '.';

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
    const domainConfig = this.config.getDomainConfig() as EthereumConfig;
    const feeRouter = FeeHandlerRouter__factory.connect(domainConfig.feeRouter, this.provider);
    const feeHandlerAddress = await feeRouter._domainResourceIDToFeeHandlerAddress(
      transfer.to.id,
      transfer.resource.resourceId,
    );
    const feeHandlerConfig = domainConfig.feeHandlers.find(
      feeHandler => feeHandler.address == feeHandlerAddress,
    )!;

    switch (feeHandlerConfig.type) {
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
      case FeeHandlerType.DYNAMIC: {
        return await calculateDynamicFee({
          provider: this.provider,
          sender: transfer.sender,
          recipientAddress: transfer.recipient,
          fromDomainID: Number(transfer.from.id),
          toDomainID: Number(transfer.to.id),
          resourceID: transfer.resource.resourceId,
          tokenAmount: (transfer.amount as Fungible).amount,
          feeOracleBaseUrl: getFeeOracleBaseURL(this.environment),
          feeHandlerAddress: feeHandlerAddress,
        });
      }
      default:
        throw new Error(`Unsupported fee handler type`);
    }
  }

  /**
   * Builds approval transactions that are required before executing
   * deposit. Returns multiple approvals if fee is payed in ERC20 token.
   *
   * @param transfer requested transfer
   * @param fee Fee calculated by 'getFee' function
   * @returns array of unsigned approval transaction
   */
  public async buildApprovals(
    transfer: Transfer<TransferType>,
    fee: EvmFee,
  ): Promise<Array<UnsignedTransaction>> {
    const bridge = Bridge__factory.connect(this.config.getDomainConfig().bridge, this.provider);
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
   * @param transfer
   * @param fee
   * @returns unsigned transfer transaction
   */
  public async buildTransferTransaction(
    transfer: Transfer<TransferType>,
    fee: EvmFee,
  ): Promise<PopulatedTransaction> {
    const bridge = Bridge__factory.connect(this.config.getDomainConfig().bridge, this.provider);
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        return await erc20Transfer({
          amount: (transfer.amount as Fungible).amount,
          recipientAddress: transfer.recipient,
          bridgeInstance: bridge,
          domainId: transfer.to.id.toString(),
          resourceId: transfer.resource.resourceId,
          feeData: fee,
        });
      }
      case ResourceType.NON_FUNGIBLE: {
        return await erc721Transfer({
          id: (transfer.amount as NonFungible).id,
          recipientAddress: transfer.recipient,
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

  private async getERC20Approvals(
    erc20: ERC20,
    fee: EvmFee,
    transfer: Transfer<Fungible>,
    handlerAddress: string,
  ): Promise<Array<PopulatedTransaction>> {
    const approvals: Array<PopulatedTransaction> = [];
    if (
      fee.type == FeeHandlerType.DYNAMIC &&
      (await getERC20Allowance(transfer.sender, erc20, fee.handlerAddress)).lt(fee.fee)
    ) {
      approvals.push(await approve(fee.fee.toString(), erc20, fee.handlerAddress));
    }

    const transferAmount = BigNumber.from(transfer.amount.amount);
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
    if (!(await isApproved(Number(transfer.amount.id), erc721, handlerAddress))) {
      approvals.push(await approve(transfer.amount.id, erc721, handlerAddress));
    }

    return approvals;
  }
}
