import { EvmBridgeSetupList } from "@buildwithsygma/sygma-sdk-core/deprecated";
import { SubstrateConfigType } from "./types";

export const substrateConfig: SubstrateConfigType = {
  domainId: "5",
  appName: "sygma-sdk-substrate-react-example",
  provider_socket: "wss://rhala-node.phala.network/ws",
  assets: [
    {
      assetName: "USDC",
      assetId: 1000,
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
      },
    },
  ],
};
export const evmSetupList: EvmBridgeSetupList = [
  {
    domainId: "0",
    networkId: 5,
    type: "Ethereum",
    name: "Goerli",
    decimals: 18,
    bridgeAddress: "0xb36C801f644908bAAe89b7C28ad57Af18638A6a9",
    erc20HandlerAddress: "0xAf2DB8059Bd69ba9Ac4c59D25de1C87931e62448",
    erc721HandlerAddress: "0x201cBF8199DbF982c05185869FE063A744d797e2",
    rpcUrl:
      "https://eth-goerli.g.alchemy.com/v2/wkF4rGEBspanIYTCzspMVFbOPjHP_IhL",
    feeHandlers: [],
    feeRouterAddress: "",
    tokens: [
      {
        type: "erc20",
        address: "0xB376b0Ee6d8202721838e76376e81eEc0e2FE864",
        name: "ERC20Test",
        symbol: "ERC20TST",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000001000",
        feeSettings: {
          type: "basic",
          address: "0xFf6312a3D0022F75d2Bd92CF250B14A5Ea915945",
        },
      },
    ],
  },
];
