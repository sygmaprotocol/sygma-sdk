export type Domain = {
  id: string;
  name: string;
};

export enum ResourceType {
  FUNGIBLE = 'fungible',
  NON_FUNGIBLE = 'nonFungible',
  PERMISSIONED_GENERIC = 'permissionedGeneric',
  PERMISSIONLESS_GENERIC = 'permissionlessGeneric',
}

export type Resource = {
  resourceId: string;
  type: ResourceType;
  address: string;
  symbol: string;
  decimals: number;
};

export type FungibleAssetAmount = {
  amount: string;
};

export type NonFungibleAssetAmount = {
  id: string;
};

export type TransferAmount = FungibleAssetAmount | NonFungibleAssetAmount;

export interface Transfer<TransferAmount> {
  sender: string;
  from: Domain;
  to: Domain;
  resource: Resource;
  recipient: string;
  amount: TransferAmount;
}
