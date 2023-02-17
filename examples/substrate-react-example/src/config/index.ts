import {SubstrateConfigType} from "@buildwithsygma/sygma-sdk-core";
const config: SubstrateConfigType = {
  appName: "sygma-sdk-substrate-react-example",
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
