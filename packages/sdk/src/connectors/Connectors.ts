// SIGNER DEPENDS ON THE CONTEXT
// BUT CONTEXT DEPENDS IF WE ARE PASSING OR NOT
// ADDRESS TO THE INITIALIZE CONNECTION

import { ethers } from "ethers";
import { Provider, Signer } from "../types";

interface IConnector {
  getSignerBalance(): Promise<ethers.BigNumber>
  getSignerAddress(): Promise<string>
  getSignerGasPrice(): Promise<ethers.BigNumber>
}

export default class Connector implements IConnector {
  private provider: Provider
  private signer: Signer

  constructor(rpcURL?: string, address?: string) {
    if (!rpcURL) {
      if (window && window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        )
        this.signer = this.provider.getSigner()
      }
      console.warn("No ethereum object and rpc url to initialize provider")
    }
    this.provider = new ethers.providers.JsonRpcProvider(rpcURL)
    if(address){
      this.signer = this.provider.getSigner(address)
    }
  }

  static getInstance(rpcURL?: string, address?: string) {
    const provider = new Connector(rpcURL, address)
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

  public setSigner(address:string){
    this.signer = this.provider!.getSigner(address)
  }
}
