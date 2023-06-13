import { Fungible, Transfer } from '../types';
import { Config } from '../config';

export abstract class BaseAssetTransfer {
  public config!: Config;

  public createFungibleTransfer(
    sourceAddress: string,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: number,
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
      throw new Error('Resource not found');
    }

    const transfer: Transfer<Fungible> = {
      sender: sourceAddress,
      amount: {
        amount: amount.toString(),
      },
      from: sourceDomain,
      to: destinationDomain,
      resource: selectedResource,
      recipient: destinationAddress,
    };

    return transfer;
  }
}
