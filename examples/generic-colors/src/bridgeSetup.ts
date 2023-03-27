import { EvmBridgeSetupList } from "@buildwithsygma/sygma-sdk-core";

const bridgeAddress = "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68";
const permissionlessGenericHandler =
  "0xE837D42dd3c685839a418886f418769BDD23546b";
const feeRouterAddress = "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A";
const basicFeeAddress = "0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94";
const erc20HandlerAddress = "0x02091EefF969b33A5CE8A729DaE325879bf76f90";
const erc721HandlerAddress = "0xC2D334e2f27A9dB2Ed8C4561De86C1A00EBf6760";
const ERC20Token = "0x37356a2B2EbF65e5Ea18BD93DeA6869769099739";

const bridgeSetupList: EvmBridgeSetupList = [
  {
    domainId: "1",
    networkId: 1337,
    name: "Local EVM 1",
    decimals: 18,
    bridgeAddress: bridgeAddress,
    erc20HandlerAddress: erc20HandlerAddress,
    erc721HandlerAddress: erc721HandlerAddress,
    rpcUrl: "http://localhost:8545",
    type: "Ethereum",
    tokens: [
      {
        type: "erc20",
        address: ERC20Token,
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: basicFeeAddress,
        },
      },
    ],
  },
  {
    domainId: "2",
    networkId: 1338,
    name: "Local EVM 2",
    decimals: 18,
    bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
    erc20HandlerAddress: "0x1ED1d77911944622FCcDDEad8A731fd77E94173e",
    erc721HandlerAddress: "0x481f97f9C82a971B3844a422936a4d3c4082bF84",
    rpcUrl: "http://localhost:8547",
    type: "Ethereum",
    tokens: [
      {
        type: "erc20",
        address: ERC20Token,
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: basicFeeAddress,
        },
      },
    ],
  },
]

const node1RpcUrl = "http://localhost:8545";
const node2RpcUrl = "http://localhost:8547";

const bridgeAdmin = "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b";

export {
  bridgeAddress,
  feeRouterAddress,
  permissionlessGenericHandler,
  basicFeeAddress,
  bridgeSetupList,
  node1RpcUrl,
  node2RpcUrl,
  bridgeAdmin,
};
