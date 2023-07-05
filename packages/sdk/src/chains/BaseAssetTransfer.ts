import { Environment, Fungible, Transfer } from '../types';
import { Config } from '../config';

export abstract class BaseAssetTransfer {
  public config!: Config;
  public environment!: Environment;

  /**
   * Creates a Transfer<Fungible> object which can then be used to estimate transfer
   * fees as well as create the necessary desposit and approval transactions.
   *
   * @category Bridge deposit
   * @param {string} sourceAddress - The address of the sender
   * @param {number} destinationChainId - The (Para)ChainId of the destination chain
   * @param {string} destinationAddress - The address of the recipient on the destination chain
   * @param {string} resourceId - The ID of the resource being transferred
   * @param {string} amount - The amount of tokens to be transferred. The amount should be in the lowest denomination possible on the source chain. If the token on source chain is configured to use 12 decimals and the amount to be transferred is 1 ETH, then amount should be passed in as 1000000000000
   * @returns {Transfer<Fungible>} - The populated transfer object
   * @throws {Error} - Source domain not supported, Destination domain not supported, Resource not supported
   */
  public createFungibleTransfer(
    sourceAddress: string,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: string,
  ): Transfer<Fungible> {
    const domains = this.config.getDomains();
    const sourceDomain = domains.find(domain => domain.chainId == this.config.chainId);
    if (!sourceDomain) {
      throw new Error('Source domain not supported');
    }
    const destinationDomain = domains.find(domain => domain.chainId == destinationChainId);
    if (!destinationDomain) {
      throw new Error('Destination domain not supported');
    }
    const resources = this.config.getDomainResources();
    const selectedResource = resources.find(resource => resource.resourceId == resourceId);
    if (!selectedResource) {
      throw new Error('Resource not supported');
    }

    const transfer: Transfer<Fungible> = {
      sender: sourceAddress,
      details: {
        amount,
        recipient: destinationAddress,
      },
      from: sourceDomain,
      to: destinationDomain,
      resource: selectedResource,
    };

    return transfer;
  }
}
