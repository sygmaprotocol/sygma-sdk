import {
  Bridge,
  ERC20Handler__factory as Erc20HandlerFactory,
  FeeHandlerRouter__factory,
  ERC721MinterBurnerPauser,
  ERC721MinterBurnerPauser__factory as Erc721Factory,
  ERC721Handler__factory as Erc721handlerFactory,
} from '@buildwithsygma/sygma-contracts';
import { utils, BigNumber, ContractReceipt } from 'ethers';
import { Directions, Provider, FeeDataResult, TokenConfig } from '../../../types';
import { processAmountForERC20Transfer, processLenRecipientAddress } from '../../../utils';
import { Erc20Detailed } from '../../../Contracts/Erc20Detailed';
import { Erc20DetailedFactory } from '../../../Contracts/Erc20DetailedFactory';

import { createERCDepositData } from '../../../utils/helpers';

export default class EvmBridge {
  private static instance: EvmBridge;

  public static getInstance() {
    if (!this.instance) {
      return new EvmBridge();
    }
    return this.instance;
  }

  public async transfer({
    tokenType,
    amount,
    recipientAddress,
    tokenInstance,
    bridge,
    provider,
    handlerAddress,
    domainId,
    resourceId,
    feeData,
  }: {
    tokenType: 'erc20' | 'erc721';
    amount: string;
    recipientAddress: string;
    tokenInstance: Erc20Detailed | ERC721MinterBurnerPauser;
    bridge: Bridge;
    provider: Provider;
    handlerAddress: string;
    domainId: string;
    resourceId: string;
    feeData: FeeDataResult;
  }): Promise<ContractReceipt | undefined> {
    const depositData =
      tokenType === 'erc20'
        ? createERCDepositData(utils.parseUnits(amount, 18), 20, recipientAddress)
        : createERCDepositData(amount, 20, recipientAddress);

    const gasPrice = await this.isEIP1559MaxFeePerGas(provider);

    let gasPriceStringify;

    if (typeof gasPrice !== 'boolean') {
      gasPriceStringify = gasPrice.toString();
    }

    if (tokenType === 'erc721') {
      console.log(
        'approval before deposit',
        await this.getApproved(
          Number(amount),
          tokenInstance as ERC721MinterBurnerPauser,
          handlerAddress,
        ),
      );
    } else {
      console.log(
        'allowance before deposit',
        await this.checkCurrentAllowance(
          recipientAddress,
          tokenInstance as Erc20Detailed,
          handlerAddress,
        ),
      );
    }

    try {
      const tx = await bridge.deposit(domainId, resourceId, depositData, feeData.feeData, {
        gasPrice: gasPriceStringify,
        value: feeData.type === 'basic' ? feeData.fee : undefined,
      });
      const depositAction = await tx.wait(1);
      return depositAction;
    } catch (error) {
      console.log('Error on deposit', error);
    }
  }

  public async depositGeneric({
    domainId,
    resourceId,
    depositData,
    fee,
    bridge,
    provider,
  }: {
    domainId: string;
    resourceId: string;
    depositData: string;
    fee: FeeDataResult;
    bridge: Bridge;
    provider: Provider;
  }) {
    const { feeData, type } = fee;
    const gasPrice = await this.isEIP1559MaxFeePerGas(provider);

    let gasPriceStringify;

    if (typeof gasPrice !== 'boolean') {
      gasPriceStringify = gasPrice.toString();
    }

    try {
      const tx = bridge.deposit(domainId, resourceId, depositData, feeData, {
        gasPrice: gasPriceStringify,
        value: type === 'basic' ? feeData : undefined,
      });
      const depositAction = await (await tx).wait(1);
      return depositAction;
    } catch (error) {
      console.log('Error on generic deposit', error);
    }
  }

  public async approve(
    amountForApproval: BigNumber,
    tokenInstance: Erc20Detailed | ERC721MinterBurnerPauser,
    handlerAddress: string,
    gasPrice: BigNumber,
  ) {
    try {
      const tx = await tokenInstance.approve(handlerAddress, amountForApproval, {
        gasPrice,
      });
      const approvalAction = await tx.wait(1);
      return approvalAction;
    } catch (error) {
      console.log('Error on deposit', error);
    }
  }

  public async hasTokenSupplies(
    amount: number,
    to: Directions,
    provider: Provider,
    destinationERC20Address: string,
    erc20HandlerAddress: string,
    decimals: number,
  ) {
    const erc20DestinationToken = Erc20DetailedFactory.connect(destinationERC20Address, provider!);

    const destinationERC20HandlerInstance = Erc20HandlerFactory.connect(
      erc20HandlerAddress,
      provider!,
    );

    const isMintable = await destinationERC20HandlerInstance._burnList(destinationERC20Address);

    if (isMintable) {
      return true;
    }

    const balanceOfTokens = await this.getERC20Balance(erc20DestinationToken, erc20HandlerAddress);

    const amountGreaterThantBalance = Number(utils.formatUnits(balanceOfTokens, decimals)) < amount;

    const hasEnoughBalance = !amountGreaterThantBalance;

    return hasEnoughBalance;
  }

  public async checkCurrentAllowance(
    recipientAddress: string,
    erc20Instance: Erc20Detailed,
    erc20HandlerAddress: string,
  ): Promise<number> {
    const currentAllowance = await erc20Instance.allowance(recipientAddress, erc20HandlerAddress);

    return Number(utils.formatUnits(currentAllowance, 18));
  }

  public async getApproved(
    tokenId: number,
    tokenInstance: ERC721MinterBurnerPauser,
    handlerAddress: string,
  ) {
    const approvedAddress = await tokenInstance.getApproved(tokenId);
    const isApproved = approvedAddress === handlerAddress;
    return isApproved;
  }

  public async isEIP1559MaxFeePerGas(provider: Provider): Promise<BigNumber | boolean> {
    try {
      const feeData = await provider!.getFeeData();
      const { gasPrice } = feeData;
      return gasPrice as BigNumber;
    } catch (error) {
      console.log('error getting EIP 1559', error);
      return false;
    }
  }

  public async getErc20TokenInfo(ercAddress: string, accountAddress: string, provider: Provider) {
    const erc20Contract = Erc20DetailedFactory.connect(ercAddress, provider!);

    const balanceOfTokens = await erc20Contract.balanceOf(accountAddress);
    const tokenName = await erc20Contract.name();

    return { balanceOfTokens, tokenName };
  }

  public async getErc721TokenInfo(ercAddress: string, accountAddress: string, provider: Provider) {
    const ercContract = Erc721Factory.connect(ercAddress, provider!);

    const balanceOfTokens = await ercContract.balanceOf(accountAddress);
    const tokenName = await ercContract.name();

    return { balanceOfTokens, tokenName };
  }

  public async getERC20Balance(erc20Contract: Erc20Detailed, address: string): Promise<BigNumber> {
    return await erc20Contract.balanceOf(address);
  }
}
