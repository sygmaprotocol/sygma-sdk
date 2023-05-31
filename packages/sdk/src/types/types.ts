import { XcmMultiAssetIdType } from 'chains/Substrate/types';

export type Domain = {
  id: number;
  chainId: number;
  name: string;
};

export enum ResourceType {
  FUNGIBLE = 'fungible',
  NON_FUNGIBLE = 'nonfungible',
  PERMISSIONED_GENERIC = 'permissionedGeneric',
  PERMISSIONLESS_GENERIC = 'permissionlessGeneric',
}

export enum SubstrateParachain {
  LOCAL = 5,
  ROCOCO_PHALA = 5231,
}

export type Resource = EvmResource | SubstrateResource;

interface BaseResource {
  resourceId: string;
  type: ResourceType;
  symbol?: string;
  decimals?: number;
}

export type EvmResource = BaseResource & {
  address: string;
};

export type SubstrateResource = BaseResource & {
  assetId: number;
  assetName: string;
  xcmMultiAssetId: XcmMultiAssetIdType;
};

export enum FeeHandlerType {
  DYNAMIC = 'oracle',
  BASIC = 'basic',
}

export type Fungible = {
  amount: string;
};

export type NonFungible = {
  id: string;
};

export type TransferType = Fungible | NonFungible;

export type Transfer<TransferType> = {
  amount: TransferType;
  to: Domain;
  from: Domain;
  resource: Resource;
  sender: string;
  recipient: string;
};
