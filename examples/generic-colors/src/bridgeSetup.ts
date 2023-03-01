import { EvmBridgeSetupList } from "@buildwithsygma/sygma-sdk-core";

const bridgeAddress = "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68";
const genericAddress = "0x783BB8123b8532CC85C8D2deF2f47C55D1e46b46";
const feeRouterAddress = "0x9275AC64D6556BE290dd878e5aAA3a5bae08ae0C";
const basicFeeAddress = "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6";
const colorsAddress = "0xE54Dc792c226AEF99D6086527b98b36a4ADDe56a";
const erc20HandlerAddress = "0x1ED1d77911944622FCcDDEad8A731fd77E94173e";
const erc721HandlerAddress = "0x481f97f9C82a971B3844a422936a4d3c4082bF84";

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
    tokens: [
      {
        type: "erc20",
        address: "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A",
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
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
    tokens: [
      {
        type: "erc20",
        address: "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A",
        name: "ERC20LRTST",
        symbol: "ETHIcon",
        imageUri: "ETHIcon",
        decimals: 18,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000300",
        feeSettings: {
          type: "basic",
          address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
        },
      },
    ],
  },
];

const node1RpcUrl = "http://localhost:8545";
const node2RpcUrl = "http://localhost:8547";

const bridgeAdmin = "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b";

export { bridgeAddress, feeRouterAddress, genericAddress, colorsAddress, basicFeeAddress, bridgeSetupList, node1RpcUrl, node2RpcUrl, bridgeAdmin }