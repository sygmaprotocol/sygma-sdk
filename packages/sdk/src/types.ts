export type Domain = {
  id: string;
  name: string;
}

export type Resource = {
  address: string;
  name: string;
}

export type FungibleAssetAmount = {
  amount: string;
}

export type NonFungibleAssetAmount = {
  amount?: string;
  id: string;
}

export type TransferAmount = FungibleAssetAmount | NonFungibleAssetAmount;

export type Transfer = {
  from: Domain;
  to: Domain;
  resource: Resource;
  recipient: string;
  amount: TransferAmount;
}
