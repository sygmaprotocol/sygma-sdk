export type XcmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior: {
      x3: Array<{ parachain: number } | { generalKey: string }>;
    };
  };
};
export type SubstrateConfigAssetType = {
  assetName: string;
  assetId: number;
  xsmMultiAssetId: XcmMultiAssetIdType;
};
export type SubstrateConfigType = {
  domainId: string;
  appName: string;
  provider_socket: string;
  assets: SubstrateConfigAssetType[];
};
