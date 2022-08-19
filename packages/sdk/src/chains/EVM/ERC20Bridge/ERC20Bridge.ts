import { Bridge, ERC20Handler__factory as Erc20HandlerFactory, FeeHandlerRouter__factory } from '@chainsafe/chainbridge-contracts'
import { utils, BigNumber, ContractReceipt } from 'ethers'
import { Directions, Provider, FeeDataResult } from "../../../types";
import { processAmountForERC20Transfer, processLenRecipientAddress } from "../../../utils";
import { Erc20Detailed } from '../../../Contracts/Erc20Detailed'
import { Erc20DetailedFactory } from '../../../Contracts/Erc20DetailedFactory'

import { createERCDepositData } from '../../../utils/helpers';

export default class ERC20Bridge {
  private static instance: ERC20Bridge;

  public static getInstance() {
    if (!this.instance) {
      return new ERC20Bridge();
    }
    return this.instance;
  }

  public async transferERC20({
    amount,
    recipientAddress,
    erc20Intance,
    bridge,
    provider,
    erc20HandlerAddress,
    domainId,
    resourceId,
    feeData,
  }: {
    amount: string;
    recipientAddress: string;
    erc20Intance: Erc20Detailed;
    bridge: Bridge;
    provider: Provider;
    erc20HandlerAddress: string;
    domainId: string;
    resourceId: string;
    feeData: FeeDataResult;
  }): Promise<ContractReceipt | undefined> {
    const depositData = createERCDepositData(utils.parseUnits(amount), 20, recipientAddress);

    const amountForApproval = utils.parseUnits(amount.toString(), 18);

    const amountForApprovalBN = BigNumber.from(amountForApproval);

    const gasPrice = await this.isEIP1559MaxFeePerGas(provider);

    let gasPriceStringify;

    if (typeof gasPrice !== 'boolean') {
      gasPriceStringify = gasPrice.toString();
    }

    console.log("allowance before deposit", await this.checkCurrentAllowance(recipientAddress, erc20Intance, erc20HandlerAddress))

    console.warn('gas price stringified', gasPriceStringify);


    try {
      const tx = await bridge.deposit(domainId, resourceId, depositData, feeData.feeData, {
        gasPrice: gasPriceStringify,
        value: feeData.type === 'basic' ? feeData.fee : undefined
      });
      const depositAction = await(tx).wait(1);
      return depositAction
    } catch (error) {
      console.log('Error on deposit', error);
    }
  }

  public async approve(amountForApproval: BigNumber, erc20Instance: Erc20Detailed, erc20HandlerAddress: string, gasPrice: BigNumber){
    try {
      const tx = await erc20Instance.approve(
        erc20HandlerAddress,
        amountForApproval,
        {
          gasPrice
        }
      );
      const approvalAction = await(tx).wait(1);
      return approvalAction
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

  public async getTokenInfo(erc20Address: string, accountAddress: string, provider: Provider) {
    const erc20Contract = Erc20DetailedFactory.connect(erc20Address, provider!);

    const balanceOfTokens = await erc20Contract.balanceOf(accountAddress);
    const tokenName = await erc20Contract.name();

    return { balanceOfTokens, tokenName };
  }

  public async getERC20Balance(erc20Contract: Erc20Detailed, address: string): Promise<BigNumber> {
    return await erc20Contract.balanceOf(address);
  }
}
