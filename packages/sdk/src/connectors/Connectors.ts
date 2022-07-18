import { ethers } from "ethers";
import { Provider, Signer } from "../types";

export default class Connector {
  private connectorProvider: Provider | undefined
  private connectorSigner: Signer | undefined


  /**
   * Inits instance of Connector class from web3 provider instace
   * @param web3ProvideInstance
   * @returns
   */
  static initFromWeb3(web3ProvideInstance: any) {
    const provider = new Connector()
    provider.connectorProvider = new ethers.providers.Web3Provider(
      web3ProvideInstance,
      "any"
    )
    provider.connectorSigner = (provider.connectorProvider as ethers.providers.Web3Provider).getSigner()
    return provider
  }

  /**
   * Inits instance of Connector class from RPC url and RPC address
   * Design to be used in nodejs enviroment
   * @param [rpcURL]
   * @param [address]
   * @returns
   */
  static initRPC(rpcURL?: string, address?: string) {
    const provider = new Connector()
    provider.connectorProvider = new ethers.providers.JsonRpcProvider(rpcURL)
    if (address) {
      provider.connectorSigner = (provider.connectorProvider as ethers.providers.JsonRpcProvider).getSigner(address)
    }
    return provider
  }

  public async getSignerAddress(): Promise<string> {
    return await this.signer!.getAddress()
  }

  public async getSignerBalance(): Promise<ethers.BigNumber> {
    return await this.signer!.getBalance()
  }

  public async getSignerGasPrice(): Promise<ethers.BigNumber> {
    return await this.signer!.getGasPrice()
  }

  public setSigner(address: string) {
    this.connectorSigner = (this.connectorProvider as ethers.providers.JsonRpcProvider)!.getSigner(address)
  }

  get signer() {
    return this.connectorSigner
  }

  get provider() {
    return this.connectorProvider
  }
}
