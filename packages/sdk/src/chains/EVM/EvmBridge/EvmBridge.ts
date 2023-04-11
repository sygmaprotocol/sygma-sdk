import {
  Bridge,
  ERC20Handler__factory as Erc20HandlerFactory,
  ERC721MinterBurnerPauser,
  ERC721MinterBurnerPauser__factory as Erc721Factory,
} from '@buildwithsygma/sygma-contracts';
import { utils, BigNumber, ContractReceipt } from 'ethers';
import { Directions, Provider, FeeDataResult } from '../../../types';
import { Erc20Detailed } from '../../../Contracts/Erc20Detailed';
import { Erc20DetailedFactory } from '../../../Contracts/Erc20DetailedFactory';

import { createERCDepositData } from '../../../utils/helpers';

/**
 * @deprecated since version 1.4.0
 * @name EvmBridge
 * @description class that implements methods to bridge EVM networks
 */
export default class EvmBridge {
  private static instance: EvmBridge;
  public confirmations: number = 10;

  /**
   * @name getInstance
   * @description returns instance of the EvmBridge class
   * @returns {EvmBridge}
   */
  public static getInstance(): EvmBridge {
    if (!this.instance) {
      return new EvmBridge();
    }
    return this.instance;
  }

  /**
   * @name transfer
   * @description method that performs a transfer using bridge.deposit from contract interface
   * @param {Object}
   * @returns {Promise<ContractReceipt | undefined>}
   */
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
    let decimals: number;
    if (tokenType === 'erc20') {
      decimals = await (tokenInstance as Erc20Detailed).decimals();
    } else {
      decimals = 0;
    }
    const depositData = createERCDepositData(amount, recipientAddress, decimals);

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
      const senderAddress = await bridge.signer.getAddress();
      console.log(
        'allowance before deposit',
        await this.checkCurrentAllowance(
          senderAddress,
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
      const depositAction = await tx.wait(this.confirmations);
      return depositAction;
    } catch (error) {
      console.log('Error on deposit', error);
    }
  }

  /**
   * @name depositGeneric
   * @description method to use for GMP using Generic Handler
   * @param {Object}
   * @returns {Promise<ContractReceipt | undefined>}
   */
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
  }): Promise<ContractReceipt | undefined> {
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
      const depositAction = await (await tx).wait(this.confirmations);
      return depositAction;
    } catch (error) {
      console.log('Error on generic deposit', error);
    }
  }

  /**
   * @name approve
   * @description approves amount to handler address
   * @param amountForApproval - BigNumber
   * @param tokenInstance - ERC20 token instance
   * @param handlerAddress - string with the address of the handler
   * @param gasPrice - BigNumber
   * @returns {Promise<ContractReceipt | undefined>}
   */
  public async approve(
    amountForApproval: BigNumber,
    tokenInstance: Erc20Detailed | ERC721MinterBurnerPauser,
    handlerAddress: string,
    gasPrice: BigNumber,
  ): Promise<ContractReceipt | undefined> {
    try {
      const tx = await tokenInstance.approve(handlerAddress, amountForApproval, {
        gasPrice,
      });
      const approvalAction = await tx.wait(this.confirmations);
      return approvalAction;
    } catch (error) {
      console.log('Error on deposit', error);
    }
  }

  /**
   * @name hasTokenSupplies
   * @description check if token is in burn list and if it has balance
   * @param amount - number
   * @param to - chain1 or chain2 as Directions
   * @param provider - JsonRpcProvider or Web3Provider
   * @param destinationERC20Address - address of the destination ERC20 token
   * @param erc20HandlerAddress - address of the ERC20 handler
   * @param decimals - number
   * @returns {Promise<boolean>}
   */
  public async hasTokenSupplies(
    amount: number,
    to: Directions,
    provider: Provider,
    destinationERC20Address: string,
    erc20HandlerAddress: string,
    decimals: number,
  ): Promise<boolean> {
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

  /**
   * @name checkCurrentAllowance
   * @description check the current allowance of recipient address from handler address
   * @param senderAddress - string
   * @param erc20Instance - ERC20 token instance
   * @param erc20HandlerAddress - ERC20 handler address
   * @returns {Promise<number>}
   */
  public async checkCurrentAllowance(
    senderAddress: string,
    erc20Instance: Erc20Detailed,
    erc20HandlerAddress: string,
  ): Promise<number> {
    const currentAllowance = await erc20Instance.allowance(senderAddress, erc20HandlerAddress);

    return Number(utils.formatUnits(currentAllowance, 18));
  }

  /**
   * @name getApproved
   * @description approves the tokenId from the ERC721
   * @param tokenId - number
   * @param tokenInstance - ERC721 token instance
   * @param handlerAddress - ERC721 handler address
   * @returns {Promise<boolean>}
   */
  public async getApproved(
    tokenId: number,
    tokenInstance: ERC721MinterBurnerPauser,
    handlerAddress: string,
  ): Promise<boolean> {
    const approvedAddress = await tokenInstance.getApproved(tokenId);
    const isApproved = approvedAddress === handlerAddress;
    return isApproved;
  }

  /**
   * @name isEIP1559MaxFeePerGas
   * @description check the fee data of the provider and returns the gas price or false if the node is not EIP1559
   * @param provider - JsonRpcProvider | Web3Provider
   * @returns {Promise<BigNumber | boolean>}
   */
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

  /**
   * @name getErc20TokenInfo
   * @description returns balance of the tokens and token name
   * @param ercAddress - string
   * @param accountAddress - address of the account
   * @param provider - JsonRpcProvider | Web3Provider
   * @returns {Promise<{ balanceOfTokens: BigNumber, tokenName: string}>}
   */
  public async getErc20TokenInfo(
    ercAddress: string,
    accountAddress: string,
    provider: Provider,
  ): Promise<{
    balanceOfTokens: BigNumber;
    tokenName: string;
  }> {
    const erc20Contract = Erc20DetailedFactory.connect(ercAddress, provider!);

    const balanceOfTokens = await erc20Contract.balanceOf(accountAddress);
    const tokenName = await erc20Contract.name();

    return { balanceOfTokens, tokenName };
  }

  /**
   * @name getErc721TokenInfo
   * @description returns balance and token name from ERC721
   * @param ercAddress - ERC20 address
   * @param accountAddress - account addrss
   * @param provider - JsonRpcProvider | Web3Provider
   * @returns {Promise<{balanceOfTokens: BigNumber, tokenName: string}>}
   */
  public async getErc721TokenInfo(
    ercAddress: string,
    accountAddress: string,
    provider: Provider,
  ): Promise<{
    balanceOfTokens: BigNumber;
    tokenName: string;
  }> {
    const ercContract = Erc721Factory.connect(ercAddress, provider!);

    const balanceOfTokens = await ercContract.balanceOf(accountAddress);
    const tokenName = await ercContract.name();

    return { balanceOfTokens, tokenName };
  }

  /**
   * @name getERC20Balance
   * @description returns balance from the current account
   * @param erc20Contract - ERC20 token instance
   * @param address - account address
   * @returns {Promise<BigNumber>}
   */
  public async getERC20Balance(erc20Contract: Erc20Detailed, address: string): Promise<BigNumber> {
    return await erc20Contract.balanceOf(address);
  }
}
