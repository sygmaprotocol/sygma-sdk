// TODO: choose proper place to export config and types
export type XsmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior: {
      x3: Array<{ parachain: number } | { generalKey: string }>;
    };
  };
}
export type SubstrateConfigAssetType = {
  assetName: string;
  assetId: number;
  xsmMultiAssetId: XsmMultiAssetIdType;
}
export type SubstrateConfigType = {
  appName: string;
  CUSTOM_RPC_METHODS: {};
  provider_socket: string;
  assets: SubstrateConfigAssetType[]
};

const config: SubstrateConfigType = {
  appName: "sygma-sdk-substrate-react-example",
  CUSTOM_RPC_METHODS: {},
  provider_socket: "ws://127.0.0.1:9944",
  assets: [
    {
      assetName: 'USDC',
      assetId: 2000,
      xsmMultiAssetId: {
        concrete: {
          parents: 1,
          interior: {
            x3: [
              { parachain: 2004 },
              { generalKey: "0x7379676d61" },
              { generalKey: "0x75736463" },
            ],
          },
        },
      }
    }
  ]
};
export default config;
