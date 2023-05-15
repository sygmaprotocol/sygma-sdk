export type Domain = {
  id: number;
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
  symbol?: string;
  decimals?: number;
};

export enum FeeHandlerType {
  DYNAMIC = 'oracle',
  BASIC = 'basic',
}

export type FungibleAmount = {
  amount: string;
};

export type NonFungibleAmount = {
  id: string;
};

export type TransferAmount = FungibleAmount | NonFungibleAmount;

export type Transfer<TransferAmount> = {
  amount: TransferAmount;
  to: Domain;
  from: Domain;
  resource: Resource;
  sender: string;
  recipient: string;
};
