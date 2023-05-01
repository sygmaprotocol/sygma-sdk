import { ethers, providers } from 'ethers';
import { Provider, Signer } from '../deprecated/types';

/**
 * @name Connector
 * @description Class that carries over the logic of connection from browser context of backend
 */
export default class Connector {
  private connectorProvider: Provider | undefined;
  private connectorSigner: Signer | undefined;

  /**
   * @name initFromWeb3
   * @description Inits instance of Connector class from web3 provider instace
   * @param web3ProvideInstance
   * @returns {Connector}
   */
  static initFromWeb3(web3ProvideInstance: providers.ExternalProvider): Connector {
    const provider = new Connector();
    provider.connectorProvider = new ethers.providers.Web3Provider(web3ProvideInstance, 'any');
    provider.connectorSigner = (
      provider.connectorProvider as ethers.providers.Web3Provider
    ).getSigner();
    return provider;
  }

  /**
   * @name initRPC
   * @description Inits instance of Connector class from RPC url and RPC address
   * Design to be used in nodejs enviroment
   * @param rpcURL - url of the node
   * @param address - address to connect
   * @returns {Connector}
   */
  static initRPC(rpcURL: string, address?: string): Connector {
    const provider = new Connector();
    provider.connectorProvider = new ethers.providers.JsonRpcProvider(rpcURL);
    if (address) {
      provider.connectorSigner = (
        provider.connectorProvider as ethers.providers.JsonRpcProvider
      ).getSigner(address);
    }
    return provider;
  }

  /**
   * @name getSignerAddress
   * @description gets the signer of the address
   * @returns {Promise<string>}
   */
  public async getSignerAddress(): Promise<string> {
    return await this.signer!.getAddress();
  }

  /**
   * @name getSignerBalance
   * @description gets the signer balance
   * @returns {Promise<BigNumber>}
   */
  public async getSignerBalance(): Promise<ethers.BigNumber> {
    return await this.signer!.getBalance();
  }

  /**
   * @name getSignerGasPrice
   * @description gets the signer gas price
   * @returns {Promise<BigNumber>}
   */
  public async getSignerGasPrice(): Promise<ethers.BigNumber> {
    return await this.signer!.getGasPrice();
  }

  /**
   * @name setSigner
   * @description sets the signer
   * @param address - account address
   * @returns {void}
   */
  public setSigner(address: string): void {
    this.connectorSigner = (this.connectorProvider as ethers.providers.JsonRpcProvider)!.getSigner(
      address,
    );
  }

  /**
   * @name signer
   * @description getter of the class that returns the signer
   */
  get signer(): Signer {
    return this.connectorSigner;
  }

  /**
   * @name provider
   * @description getter for the provider
   */
  get provider(): Provider {
    return this.connectorProvider;
  }
}
