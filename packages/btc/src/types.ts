import type { BitcoinResource, Domainlike } from '@buildwithsygma/core';

export type BaseTransferParams = {
  sourceDomain: Domainlike;
  destinationAddress: string;
  amount: bigint;
  resource: BitcoinResource | string;
};

export type BitcoinTransferRequest = {
  destinationAddress: string;
  amount: bigint;
  depositAddress: string;
};
