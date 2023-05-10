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
  FeeHandlerType,
  FungibleAssetAmount,
  NonFungibleAssetAmount,
  ResourceType,
  Transfer,
  TransferAmount,
} from '../../types';
import { Config } from '../..';
import { getFeeOracleBaseURL } from '../../utils';
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

export class EVMAssetTransfer {
  private provider: providers.BaseProvider;
  private environment!: Environment;

  public config!: Config;

  constructor(provider: providers.BaseProvider) {
    this.provider = provider;
  }

  public async init(environment?: Environment): Promise<void> {
    const network = await this.provider.getNetwork();
    this.environment = environment ? environment : Environment.MAINNET;
    this.config = new Config();
    await this.config.init(network.chainId, environment);
  }

  public async getFee(transfer: Transfer<TransferAmount>): Promise<EvmFee> {
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
          tokenAmount: (transfer.amount as FungibleAssetAmount).amount,
          feeOracleBaseUrl: getFeeOracleBaseURL(this.environment),
          feeHandlerAddress: feeHandlerAddress,
        });
      }
      default:
        throw new Error(`Unsupported fee handler type`);
    }
  }

  public async buildApprovals(
    transfer: Transfer<TransferAmount>,
    fee: EvmFee,
  ): Promise<Array<UnsignedTransaction>> {
    const bridge = Bridge__factory.connect(this.config.getDomainConfig().bridge, this.provider);
    const handlerAddress = await bridge._resourceIDToHandlerAddress(transfer.resource.resourceId);

    const approvals: Array<PopulatedTransaction> = [];
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        const erc20 = ERC20__factory.connect(transfer.resource.address, this.provider);
        approvals.push(
          ...(await this.getERC20Approvals(
            erc20,
            fee,
            transfer as Transfer<FungibleAssetAmount>,
            handlerAddress,
          )),
        );
        break;
      }
      case ResourceType.NON_FUNGIBLE: {
        const erc721 = ERC721MinterBurnerPauser__factory.connect(
          transfer.resource.address,
          this.provider,
        );
        approvals.push(
          ...(await this.getERC721Approvals(
            erc721,
            transfer as Transfer<NonFungibleAssetAmount>,
            handlerAddress,
          )),
        );
        break;
      }
      default:
        throw new Error(`Resource type ${transfer.resource.type} not supported by asset transfer`);
    }

    return approvals;
  }

  public async buildTransferTransaction(
    transfer: Transfer<TransferAmount>,
    fee: EvmFee,
  ): Promise<PopulatedTransaction> {
    const bridge = Bridge__factory.connect(this.config.getDomainConfig().bridge, this.provider);
    switch (transfer.resource.type) {
      case ResourceType.FUNGIBLE: {
        const erc20 = ERC20__factory.connect(transfer.resource.address, this.provider);
        return await erc20Transfer({
          amount: (transfer.amount as FungibleAssetAmount).amount,
          recipientAddress: transfer.recipient,
          tokenInstance: erc20,
          bridgeInstance: bridge,
          domainId: transfer.to.id,
          resourceId: transfer.resource.resourceId,
          feeData: fee,
        });
      }
      case ResourceType.NON_FUNGIBLE: {
        const erc721 = ERC721MinterBurnerPauser__factory.connect(
          transfer.resource.address,
          this.provider,
        );
        return await erc721Transfer({
          id: (transfer.amount as NonFungibleAssetAmount).id,
          recipientAddress: transfer.recipient,
          tokenInstance: erc721,
          bridgeInstance: bridge,
          domainId: transfer.to.id,
          resourceId: transfer.resource.resourceId,
          feeData: fee,
        });
      }
      default:
        throw new Error(`Resource type ${transfer.resource.type} not supported by asset transfer`);
    }
  }

  private async getERC20Approvals(
    erc20: ERC20,
    fee: EvmFee,
    transfer: Transfer<FungibleAssetAmount>,
    handlerAddress: string,
  ): Promise<Array<PopulatedTransaction>> {
    const approvals: Array<PopulatedTransaction> = [];
    if (
      fee.type == FeeHandlerType.DYNAMIC &&
      (await getERC20Allowance(transfer.sender, erc20, fee.handlerAddress)).lt(fee.fee)
    ) {
      approvals.push(await approve(fee.fee, erc20, fee.handlerAddress));
    }

    const transferAmount = BigNumber.from(transfer.amount.amount);
    if ((await getERC20Allowance(transfer.sender, erc20, handlerAddress)).lt(transferAmount)) {
      approvals.push(await approve(transferAmount, erc20, handlerAddress));
    }

    return approvals;
  }

  private async getERC721Approvals(
    erc721: ERC721MinterBurnerPauser,
    transfer: Transfer<NonFungibleAssetAmount>,
    handlerAddress: string,
  ): Promise<Array<PopulatedTransaction>> {
    const approvals: Array<PopulatedTransaction> = [];
    if (!(await isApproved(Number(transfer.amount.id), erc721, handlerAddress))) {
      approvals.push(await approve(BigNumber.from(transfer.amount.id), erc721, handlerAddress));
    }

    return approvals;
  }
}
