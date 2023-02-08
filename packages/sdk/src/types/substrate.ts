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
  appName: string;
  CUSTOM_RPC_METHODS: {};
  provider_socket: string;
  assets: SubstrateConfigAssetType[];
};
