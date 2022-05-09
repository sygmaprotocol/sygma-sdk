import { ethers } from "ethers";
import { Provider, Signer } from "../types";

interface IConnector {
  getSignerBalance(): Promise<ethers.BigNumber>
  getSignerAddress(): Promise<string>
  getSignerGasPrice(): Promise<ethers.BigNumber>
}

export default class Connector implements IConnector {
  private connectorProvider: Provider | undefined
  private connectorSigner: Signer | undefined

  constructor(rpcURL?: string, address?: string) {
    if (!rpcURL && !address) {
      if (typeof window !== "undefined") {
        if ("ethereum" in window) {
          this.connectorProvider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
          )
          this.connectorSigner = this.connectorProvider.getSigner()
        } else {
          console.warn("No ethereum object to initialize provider on the Browser")
          this.connectorProvider = undefined
        }
      }
    } else {
      this.connectorProvider = new ethers.providers.JsonRpcProvider(rpcURL)
      if (address) {
        this.connectorSigner = this.connectorProvider.getSigner(address)
      }
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

  public setSigner(address: string) {
    this.connectorSigner = this.connectorProvider!.getSigner(address)
  }

  get signer() {
    return this.connectorSigner
  }

  get provider() {
    return this.connectorProvider
  }
}
