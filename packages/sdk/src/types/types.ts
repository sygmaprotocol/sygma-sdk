export type Domain = {
  id: string;
  name: string;
};

export enum ResourceType {
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  PERMISSIONED_GENERIC = 'permissionedGeneric',
  PERMISSIONLESS_GENERIC = 'permissionlessGeneric',
}

export type Resource = {
  resourceId: string;
  type:
    | ResourceType.ERC20
    | ResourceType.ERC721
    | ResourceType.PERMISSIONED_GENERIC
    | ResourceType.PERMISSIONLESS_GENERIC;
  address: string;
  symbol: string;
  decimals: number;
};

export type FungibleAssetAmount = {
  amount: string;
};

export type NonFungibleAssetAmount = {
  amount?: string;
  id: string;
};

export type TransferAmount = FungibleAssetAmount | NonFungibleAssetAmount;

export type Transfer = {
  sender: string;
  from: Domain;
  to: Domain;
  resource: Resource;
  recipient: string;
  amount: TransferAmount;
};
