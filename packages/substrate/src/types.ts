import type { Domain, Resource } from '@buildwithsygma/core';
import type { BN } from '@polkadot/util';

export type ParachainId = number;

export type SubstrateFee = {
  fee: BN;
  type: FeeHandlerType;
};

export enum SubstrateParachain {
  LOCAL = 5,
  ROCOCO_PHALA = 5231,
}

export enum FeeHandlerType {
  DYNAMIC = 'oracle',
  BASIC = 'basic',
  PERCENTAGE = 'percentage',
  UNDEFINED = 'undefined',
}

type AssetTransfer = {
  recipient: string;
  parachainId?: ParachainId;
};

export type Fungible = AssetTransfer & {
  amount: string;
};

export type NonFungible = AssetTransfer & {
  tokenId: string;
};

export type GenericMessage = {
  destinationContractAddress: string;
  destinationFunctionSignature: string;
  executionData: string;
  maxFee: string;
  tokenAmount: string;
};

export type TransferType = Fungible | NonFungible | GenericMessage;

export type Transfer<TransferType> = {
  details: TransferType;
  to: Domain;
  from: Domain;
  resource: Resource;
  sender: string;
};

export type LiquidityError = Error & { maximumTransferAmount: bigint };

export type TransferStatus = 'pending' | 'executed' | 'failed';

export type TransferStatusResponse = {
  status: TransferStatus;
  explorerUrl: string;
  fromDomainId: number;
  toDomainId: number;
};

export type RouteIndexerType = {
  fromDomainId: string;
  toDomainId: string;
  resourceId: string;
  type: string;
};

export type DomainMetadata = {
  url: string; // icon url
};

export type EnvironmentMetadata = {
  // domainID -> DomainMetadata
  [key: number]: DomainMetadata;
};
