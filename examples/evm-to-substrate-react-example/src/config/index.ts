import { EvmBridgeSetupList } from "@buildwithsygma/sygma-sdk-core";
import { XcmMultiAssetIdType } from "@buildwithsygma/sygma-sdk-core/src/chains/Substrate";

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

export const substrateConfig: SubstrateConfigType = {
  domainId: "3",
  appName: "sygma-sdk-substrate-react-example",
  provider_socket: "ws://127.0.0.1:9944",
  assets: [
    {
      assetName: "USDC",
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
      },
    },
  ],
};
export const evmSetupList: EvmBridgeSetupList = [
  {
    domainId: "1",
    networkId: 1337,
    type: "Ethereum",
    name: "Local EVM 1",
    decimals: 18,
    bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
    erc20HandlerAddress: "0x02091EefF969b33A5CE8A729DaE325879bf76f90",
    erc721HandlerAddress: "0xC2D334e2f27A9dB2Ed8C4561De86C1A00EBf6760",
    rpcUrl: "http://localhost:8545",
    feeHandlers: [],
    feeRouterAddress: "",
    tokens: [
      {
        type: "erc20",
        address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: "0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94",
        },
      },
    ],
  },
  {
    domainId: "2",
    networkId: 1338,
    type: "Ethereum",
    name: "Local EVM 2",
    decimals: 18,
    bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
    erc20HandlerAddress: "0x02091EefF969b33A5CE8A729DaE325879bf76f90",
    erc721HandlerAddress: "0x481f97f9C82a971B3844a422936a4d3c4082bF84",
    rpcUrl: "http://localhost:8547",
    feeHandlers: [],
    feeRouterAddress: "",
    tokens: [
      {
        type: "erc20",
        address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: "0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94",
        },
      },
    ],
  },
];
