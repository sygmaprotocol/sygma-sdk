// @ts-nocheck
import React, { useEffect, useReducer, useState } from "react";
import { NonceManager } from "@ethersproject/experimental";
import {
  Bridge__factory,
  BasicFeeHandler__factory,
} from "@buildwithsygma/sygma-contracts";
import { ethers } from "ethers";
import { Sygma } from "@buildwithsygma/sygma-sdk-core";
import "./App.css";
import ColorContract from "./artifacts/contracts/Colors.sol/Colors.json";
import colorNode1 from "./deploy-1.json";
import colorNode2 from "./deploy-2.json";
import { reducer } from "./reducer";
import ColorsAbi from "./abis/colors-abi.json";

const bridgeAddress = "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68";
const genericAddress = "0x783BB8123b8532CC85C8D2deF2f47C55D1e46b46";
const feeRouterAddress = "0x9275AC64D6556BE290dd878e5aAA3a5bae08ae0C";
const basicFeeAddress = "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6";
const colorsAddress = "0xE54Dc792c226AEF99D6086527b98b36a4ADDe56a";
const erc20HandlerAddress = "0x1ED1d77911944622FCcDDEad8A731fd77E94173e";
const erc721HandlerAddress = "0x481f97f9C82a971B3844a422936a4d3c4082bF84";

const GAS_LIMIT = 2074040;

const bridgeSetupList: SygmaBridgeSetupList = [
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

const providerNode1 = new ethers.providers.JsonRpcProvider(node1RpcUrl);
const providerNode2 = new ethers.providers.JsonRpcProvider(node2RpcUrl);

const bridgeAdmin = "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b";

const walletNode1 = ethers.Wallet.fromMnemonic(
  "black toward wish jar twin produce remember fluid always confirm bacon slush",
  "m/44'/60'/0'/0/0",
);

const walletNode2 = ethers.Wallet.fromMnemonic(
  "black toward wish jar twin produce remember fluid always confirm bacon slush",
  "m/44'/60'/0'/0/0",
);

const walletSignerNode1 = walletNode1.connect(providerNode1);
console.log(
  "🚀 ~ file: colors.local.tx.ts ~ line 33 ~ walletSignerNode1",
  walletSignerNode1.address,
);
const walletSignerNode2 = walletNode2.connect(providerNode2);
console.log(
  "🚀 ~ file: colors.local.tx.ts ~ line 35 ~ walletSignerNode2",
  walletSignerNode2.address,
);

const managedSignerNode1 = new NonceManager(walletSignerNode1);
const managedSignerNode2 = new NonceManager(walletSignerNode2);

const initState = {
  colorsNode1: [],
  colorsNode2: [],
  txInit: false,
  removeColors: false,
  newLength: 3,
};

const bridgeContract = new ethers.Contract(bridgeAddress, Bridge__factory.abi);

const basicFeeHandlerContract = new ethers.Contract(
  basicFeeAddress,
  BasicFeeHandler__factory.abi,
);

function App() {
  const [txInit, setTxInit] = useState(false);
  const [state, dispatch] = useReducer(reducer, initState);
  const [addresses, setAddresses] = useState({});
  const [sygmaInstance, setSygmaInstance] = useState({});
  const [metaIsConnected, setMetaIsConnected] = useState(false);
  const [accountData, setAccountData] = useState(undefined);
  const [data, setData] = useState(undefined);
  const [logicConnected, setLogicConnected] = useState(false);

  const colorContractNode1 = new ethers.Contract(colorsAddress, ColorsAbi.abi);

  const colorContractNode2 = new ethers.Contract(colorsAddress, ColorsAbi.abi);

  const filtersNode2 = colorContractNode2
    .connect(managedSignerNode2)
    .filters.setColorEvent();

  colorContractNode2
    .connect(managedSignerNode2)
    .on(filtersNode2, (color) => console.log("color being set", color));

  const handleConnect = () => {
    // IF META IS NOT SIGNIN, TRIGGER POP OF THE WINDOW FOR THE EXTENSION
    if (!metaIsConnected) {
      return window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((r: any) => {
          console.log("request to unlock metamask", r);
          const [addr] = r;
          setMetaIsConnected(true);
          setAccountData({
            ...(accountData as LocalData),
            address: addr,
          });
        })
        .catch((error: any) => {
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log("Please connect to MetaMask.");
          } else {
            console.error(error);
          }
        });
    } else if (metaIsConnected) {
      const data = sygmaInstance?.initializeConnectionFromWeb3Provider(
        window.ethereum,
      );

      //@ts-ignore-line
      setData(data);
      setLogicConnected(true);
    }
  };

  const handleClick = async () => {
    console.log("handleClick");
    const first = state.colorsNode1[0];
    const formatedHex = first.substr(1);
    const depositFunctionSignature = "0x103b854b";
    const colorsResouceId =
      "0x0000000000000000000000000000000000000000000000000000000000000500";
    console.log(
      "🚀 ~ file: App.tsx ~ line 148 ~ handleClick ~ first",
      formatedHex,
    );
    let fee;

    const depositDataFee = `0x${
      ethers.utils.hexZeroPad(100, 32).substr(2) +
      ethers.utils.hexZeroPad(addresses.addressNode1.length, 32).substr(2) +
      (await managedSignerNode1.getAddress()).substr(2)
    }`;

    // const basicFeeData = await (sygmaInstance as Sygma).fetchBasicFeeData({
    //   amount: "1000000",
    //   recipientAddress: bridgeAdmin,
    // });
    // console.log(
    //   "🚀 ~ file: App.tsx ~ line 169 ~ handleClick ~ basicFeeData",
    //   basicFeeData,
    // );

    let feeData;

    try {
      const tx = await basicFeeHandlerContract
        .connect(walletSignerNode1)
        .calculateFee(
          bridgeAdmin,
          1,
          2,
          colorsResouceId,
          depositDataFee,
          "0x00",
        );

      feeData = tx[0];
      console.log("Getting fee =>", fee.toString());
    } catch (e) {
      console.log("error getting basic fee", e);
    }

    const hexColor = sygmaInstance.toHex(`0x${formatedHex}`, 32);

    const depositData = sygmaInstance.createGenericDepositDataV1(
      depositFunctionSignature,
      colorsAddress,
      2000000,
      bridgeAdmin,
      hexColor,
      false,
    );

    // try {
    //   await (
    //     await bridgeContract
    //       .connect(managedSignerNode1)
    //       .deposit(2, colorsResouceId, depositData, "0x00", {
    //         value: fee.toString(),
    //         gasLimit: GAS_LIMIT,
    //       })
    //   ).wait();
    //   console.log("success on deposit");
    // } catch (e) {
    //   console.log("Error on deposit", e);
    // }

    try {
      const depositTx = await sygmaInstance.depostiGeneric(
        colorsResouceId,
        depositData,
        feeData,
      );
      const depositEvent = await sygmaInstance!.getDepositEventFromReceipt(
        depositTx!,
      );
      const { depositNonce } = depositEvent.args;
      console.log(
        "🚀 ~ file: App.tsx ~ line 265 ~ handleClick ~ depositNonce",
        depositNonce.toNumber(),
      );
      console.log("result of transfer", depositTx);
    } catch (e) {
      console.log("Error on deposit with Sygma to generic", e);
    }

    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });
    await managedSignerNode1.sendTransaction({
      to: "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
      value: ethers.utils.parseEther("1.0"),
    });

    dispatch({
      type: "txInit",
      payload: true,
    });
  };

  // DISPLAY CURRENT LENGHT OF THE ARRAY
  const getNewColors = async () => {
    const newLength = await colorContractNode2
      .connect(managedSignerNode2)
      .getColorsArrayLenght();
    alert(`new length => ${newLength.toString()}`);
  };

  const getColorsNode1 = async () => {
    console.log(
      "COLOR LENGHT",
      (
        await colorContractNode1
          .connect(managedSignerNode1)
          .getColorsArrayLenght()
      ).toString(),
    );
    const color = await colorContractNode1
      .connect(managedSignerNode1)
      .colorsArray(3);
    const decodedColor = `#${ethers.utils
      .hexStripZeros(color)
      .substr(2)
      .toUpperCase()}`;
    console.log(
      "🚀 ~ file: App.tsx ~ line 163 ~ getColorsNode1 ~ decodedColor",
      decodedColor,
    );
    dispatch({
      type: "getColorNode1",
      payload: [decodedColor],
    });
  };

  const getColorsNode2 = async () => {
    console.log("get colors node2");
    const arrayLength = (
      await colorContractNode2
        .connect(managedSignerNode2)
        .getColorsArrayLenght()
    ).toNumber();
    console.log(
      "🚀 ~ file: App.tsx ~ line 87 ~ getColorsNode2 ~ arrayLength",
      arrayLength,
    );
    const elems = Array.from({ length: arrayLength }, (_, idx) => idx);
    let c = [];
    for await (let e of elems) {
      const color = await colorContractNode2
        .connect(managedSignerNode2)
        .getCurrentColors(e);
      const decodedColor = `#${ethers.utils
        .hexStripZeros(color)
        .substr(2)
        .toUpperCase()}`;
      c.push(decodedColor);
    }
    dispatch({
      type: "getColorsNode2",
      payload: c,
    });
  };

  const setAddressesFunc = async () => {
    const addressNode1 = await managedSignerNode1.getAddress();
    const addressNode2 = await managedSignerNode2.getAddress();
    setAddresses({
      addressNode1,
      addressNode2,
    });
  };

  useEffect(() => {
    if (window.ethereum !== undefined) {
      window.ethereum._metamask.isUnlocked().then((d: any) => {
        console.log("is metamask unlocked?", d);
        setMetaIsConnected(d);
      });
    }
  }, []);

  useEffect(() => {
    if (metaIsConnected && sygmaInstance !== undefined) {
      handleConnect();
      // getAccountData(sygmaInstance! as Sygma);
    }
  }, [metaIsConnected]);

  useEffect(() => {
    getColorsNode1();
    getColorsNode2();
    setAddressesFunc();
    const setup = { bridgeSetupList };
    const sygma = new Sygma(setup);
    const data = sygma?.initializeConnectionFromWeb3Provider(window.ethereum);
    setSygmaInstance(sygma);
  }, []);

  useEffect(() => {
    if (state.txInit) {
      console.log("GET COLOR NODE!!!");
      // setColorNode();
      setTimeout(() => {
        getColorsNode2();
      }, 15000);
    } else {
      setTimeout(() => {
        console.log("else");
        getColorsNode1();
        getColorsNode2();
      }, 4000);
    }

    if (state.removeColors) {
      setTimeout(() => {
        console.log("remove colors useEffect");
        getColorsNode1();
        getColorsNode2();
        dispatch({
          type: "removeColors",
          payload: false,
        });
      }, 4000);
    }
  }, [state.txInit, state.removeColors]);

  console.log(state);

  return (
    <div className="App">
      <div className="title">
        <div className="title-info">
          <h1>Generic Colors</h1>

          <p className={!txInit ? "off-color" : "on-color"}>
            Status: {txInit ? "On" : "Off"}
          </p>
        </div>
      </div>
      <div className="main-content">
        <div className="box">
          <h4>Node 1: {node1RpcUrl}</h4>
          <h5>
            Signer: {Object.keys(addresses).length && addresses.addressNode1}
          </h5>
          <ul>
            {state?.colorsNode1.length &&
              state.colorsNode1.map((color, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "10px",
                  }}
                >
                  {`Color: ${color}`}{" "}
                  <span
                    style={{
                      border: "1px solid",
                      marginLeft: "10px",
                      height: "15px",
                      width: "15px",
                      backgroundColor: color,
                    }}
                  ></span>
                </li>
              ))}
          </ul>
        </div>
        <div className="box">
          <h4>Node 2: {node2RpcUrl}</h4>
          <h5>
            Signer: {Object.keys(addresses).length && addresses.addressNode2}
          </h5>
          <ul>
            {state?.colorsNode2.length &&
              state.colorsNode2.map((color, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "10px",
                  }}
                >
                  {`Color: ${color}`}{" "}
                  <span
                    style={{
                      border: "1px solid",
                      marginLeft: "10px",
                      height: "15px",
                      width: "15px",
                      backgroundColor: color,
                    }}
                  ></span>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="start-button">
        <button onClick={handleClick}>Start transactions</button>
        {/* <button onClick={getNewColors}>Get current colors length</button>
        <button onClick={removeColors}>Remove them</button> */}
        <button
          onClick={handleConnect}
          style={{
            background: "dodgerblue",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Connect
        </button>
      </div>
    </div>
  );
}

export default App;
