import { Bridge, ERC20Handler__factory as Erc20HandlerFactory } from '@chainsafe/chainbridge-contracts'
import { utils, BigNumber } from 'ethers'
import { Directions, Provider } from "../../../types";
import { processAmountForERC20Transfer, processLenRecipientAddress } from "../../../utils";
import { Erc20Detailed } from '../../../Contracts/Erc20Detailed'
import { Erc20DetailedFactory } from '../../../Contracts/Erc20DetailedFactory'

export default class ERC20Bridge {
  private static instance: ERC20Bridge

  public static getInstance() {
    if (!this.instance) {
      return new ERC20Bridge()
    }
    return this.instance
  }

  public async transferERC20(
    amount: number,
    recipientAddress: string,
    erc20Intance: Erc20Detailed,
    bridge: Bridge,
    provider: Provider,
    erc20HandlerAddress: string,
    domainId: string,
    resourceId: string
  ) {
    const preparedDataToTransfer = this.prepareData(
      amount,
      recipientAddress
    )

    const amountForApproval = utils.parseUnits(amount.toString(), 18);

    const amountForApprovalBN = BigNumber.from(amountForApproval);

    const gasPrice = await this.isEIP1559MaxFeePerGas(
      provider
    )

    let gasPriceStringify

    if (typeof gasPrice !== "boolean") {
      gasPriceStringify = gasPrice.toString()
    }

    // TODO: THIS IS TEMPORARY
    let approve

    try {
      approve = await (
        await erc20Intance.approve(
          erc20HandlerAddress,
          amountForApprovalBN,
          {
            gasPrice: gasPrice as BigNumber
          }
        )
      ).wait(1)
    } catch (error) {
      console.log('Approve error', error);
    }

    console.log("allowance before deposit", await this.checkCurrentAllowance(recipientAddress, erc20Intance, erc20HandlerAddress))

    const bridgeFee = await bridge._fee()

    let depositAction

    console.warn("gas price stringified", gasPriceStringify)

    try {
      // TODO: check if wait 1 here
      depositAction = await (await bridge.deposit(
        domainId,
        resourceId,
        preparedDataToTransfer,
        {
          // TODO: THIS IS GOING TO BE DIFFERENT FROM WHAT WE HAVE IN THE OTHER CLASS
          gasPrice: gasPriceStringify,
          value: utils.parseUnits((bridgeFee || 0).toString(), 18),
        }
      )).wait(1)

      return depositAction
    } catch (error) {
      console.log("Error on deposit", error)
    }
  }

  public async hasTokenSupplies(
    amount: number,
    to: Directions,
    provider: Provider,
    destinationERC20Address: string,
    erc20HandlerAddress: string,
    decimals: number
  ) {
    const erc20DestinationToken = Erc20DetailedFactory.connect(destinationERC20Address, provider!)

    const destinationERC20HandlerInstance = Erc20HandlerFactory.connect(erc20HandlerAddress, provider!)

    const isMintable = await destinationERC20HandlerInstance._burnList(destinationERC20Address)

    if (isMintable) {
      return true
    }

    const balanceOfTokens = await this.getERC20Balance(erc20DestinationToken, erc20HandlerAddress)

    const amountGreaterThantBalance = Number(utils.formatUnits(balanceOfTokens, decimals)) < amount

    const hasEnoughBalance = !amountGreaterThantBalance

    return hasEnoughBalance

  }

  public async checkCurrentAllowance(recipientAddress: string, erc20Instance: Erc20Detailed, erc20HandlerAddress: string): Promise<number> {
    const currentAllowance = await erc20Instance.allowance(
      recipientAddress,
      erc20HandlerAddress
    )

    return Number(utils.formatUnits(currentAllowance, 18))
  }

  public async isEIP1559MaxFeePerGas(provider: Provider): Promise<BigNumber | boolean> {
    try {
      const feeData = await provider!.getFeeData()
      const { gasPrice } = feeData
      return gasPrice as BigNumber
    } catch (error) {
      console.log("error getting EIP 1559", error)
      return false
    }
  }

  public async getTokenInfo(
    erc20Address: string,
    accountAddress: string,
    provider: Provider
  ) {
    const erc20Contract = Erc20DetailedFactory.connect(
      erc20Address,
      provider!
    )

    const balanceOfTokens = await erc20Contract.balanceOf(accountAddress)
    const tokenName = await erc20Contract.name()

    return { balanceOfTokens, tokenName }
  }

  public async getERC20Balance(erc20Contract: Erc20Detailed, address: string): Promise<BigNumber> {
    return await erc20Contract.balanceOf(
      address
    )
  }

  private prepareData(amount: number, recipientAddress: string): string {
    const amountTransformedToData = processAmountForERC20Transfer(amount);

    // LEN(RECIPIENTADDRESS) 32 BYTES
    const toHexString = processLenRecipientAddress(recipientAddress);

    // RECIPIENT ADDRESS (32 BYTES)
    const recipientAddressTo32 = recipientAddress.substr(2);

    return `0x${amountTransformedToData}${toHexString}${recipientAddressTo32}`;
  }
}
