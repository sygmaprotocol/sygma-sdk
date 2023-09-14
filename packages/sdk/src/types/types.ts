import { ParachainID, XcmMultiAssetIdType } from 'chains/Substrate/types';

export type Domain = {
  id: number;
  chainId: number;
  name: string;
};

export type Recipient = {
  address: string;
  parachainId?: number;
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
  native?: boolean;
  burnable?: boolean;
  symbol?: string;
  decimals?: number;
}

export type EvmResource = BaseResource & {
  address: string;
};

export type SubstrateResource = BaseResource & {
  assetId?: number;
  assetName: string;
  xcmMultiAssetId: XcmMultiAssetIdType;
};

export enum FeeHandlerType {
  DYNAMIC = 'oracle',
  BASIC = 'basic',
}

type AssetTransfer = {
  recipient: string;
  parachainId?: ParachainID;
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
