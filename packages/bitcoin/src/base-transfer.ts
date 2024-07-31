import type { BitcoinResource } from '@buildwithsygma/core/src';
import type { BitcoinConfig, Config, Domain } from '@buildwithsygma/core/types';
import type { BitcoinTransferParams } from 'types';

export abstract class BaseTransfer {
  protected destinationAddress: string;
  protected amount: bigint;
  protected config: Config;
  protected resource: BitcoinResource;
  protected sourceDomain: Domain;
  protected destinationDomain: Domain;
  protected feeAmount: bigint;
  protected feeAddress: string;

  constructor(transfer: BitcoinTransferParams, config: Config) {
    this.destinationAddress = transfer.destinationAddress;
    this.amount = transfer.amount;
    this.sourceDomain = config.getDomain(transfer.source);
    this.destinationDomain = config.getDomain(transfer.destination);

    this.feeAddress = (this.sourceDomain as BitcoinConfig).feeAddress;

    const resources = config.getResources(this.sourceDomain) as BitcoinResource[];
    const resource = this.findResource(resources, transfer.resource);

    if (resource) {
      this.resource = resource;
      this.feeAmount = BigInt(resource.feeAmount as number);
    } else {
      throw new Error('Resource not found.');
    }

    this.config = config;
  }

  private findResource(
    resources: BitcoinResource[],
    resourceIdentifier: string | BitcoinResource,
  ): BitcoinResource | undefined {
    return resources.find(res => {
      return typeof resourceIdentifier === 'string'
        ? res.resourceId === resourceIdentifier
        : res.resourceId === resourceIdentifier.resourceId;
    });
  }

  /**
   * Set resource to be transferred.
   * @param {BitcoinResource} resource
   */
  setResource(resource: BitcoinResource): void {
    this.resource = resource;
  }
}
