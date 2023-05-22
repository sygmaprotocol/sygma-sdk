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

export type Resource = {
  resourceId: string;
  type: ResourceType;
  address: string;
  assetId?: number;
  assetName?: string;
  symbol?: string;
  decimals?: number;
  xsmMultiAssetId?: Object;
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
