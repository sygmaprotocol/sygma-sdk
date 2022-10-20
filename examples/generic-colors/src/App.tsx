// @ts-nocheck
import React, { useReducer } from "react";
import { NonceManager } from "@ethersproject/experimental";
import { ethers } from "ethers";
import { Sygma } from "@buildwithsygma/sygma-sdk-core";
import "./App.css";
import { reducer, State } from "./reducer";
import ColorsAbi from "./abis/colors-abi.json";
import {
  colorsAddress,
  node1RpcUrl,
  node2RpcUrl,
  bridgeAdmin,
} from "./bridgeSetup";
import { Connection, handleConnect } from "./hooks/connection";
import { AccountData } from "./hooks/accountData";
import { GetColors } from "./hooks/getColors";

const providerNode1 = new ethers.providers.JsonRpcProvider(node1RpcUrl);
const providerNode2 = new ethers.providers.JsonRpcProvider(node2RpcUrl);

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

const initState: State = {
  colorsNode1: [],
  colorsNode2: [],
  txInit: false,
  removeColors: false,
  newLength: 3,
  metamaskConnected: undefined,
  accountData: undefined,
  data: undefined,
  accountDataFromSygma: undefined,
  depositStatus: "none"
};

function App() {
  const [state, dispatch] = useReducer(reducer, initState);

  const colorContractNode1 = new ethers.Contract(colorsAddress, ColorsAbi.abi);

  const colorContractNode2 = new ethers.Contract(colorsAddress, ColorsAbi.abi);

  const filtersNode2 = colorContractNode2
    .connect(managedSignerNode2)
    .filters.setColorEvent();

  colorContractNode2
    .connect(managedSignerNode2)
    .on(filtersNode2, (color) => console.log("color being set", color));

  /**
   * Initialization of hooks for data and connection
   */
  Connection(state, dispatch);

  /**
   * Hook that gets data from the account
   */
  AccountData(state, dispatch);

  /**
   * Hook that gets the colors from the contract
   */
  GetColors(state, dispatch, colorContractNode1, colorContractNode2)

  const handleConnectInit = () => handleConnect(state, dispatch);

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

    const depositDataFee = `0x${
      ethers.utils.hexZeroPad(100, 32).substr(2) +
      ethers.utils.hexZeroPad(bridgeAdmin.length, 32).substr(2) +
      (await managedSignerNode1.getAddress()).substr(2)
    }`;
    console.log("🚀 ~ file: App.tsx ~ line 127 ~ handleClick ~ depositDataFee", depositDataFee)

    const basicFeeData = await (state.sygmaInstance as Sygma).fetchBasicFeeData({
      amount: "1000000",
      recipientAddress: bridgeAdmin,
    });
    console.log(
      "🚀 ~ file: App.tsx ~ line 169 ~ handleClick ~ basicFeeData",
      basicFeeData,
    );

    const hexColor = state.sygmaInstance.toHex(`0x${formatedHex}`, 32);
    console.log("🚀 ~ file: App.tsx ~ line 162 ~ handleClick ~ hexColor", hexColor)

    const depositData = state.sygmaInstance.createGenericDepositDataV1(
      depositFunctionSignature,
      colorsAddress,
      2000000,
      bridgeAdmin,
      hexColor,
      false,
    );
    console.log("🚀 ~ file: App.tsx ~ line 172 ~ handleClick ~ depositData", depositData)

    try {
      const depositTx = await state.sygmaInstance.depositGeneric(
        colorsResouceId,
        depositData,
        basicFeeData,
      );
      console.log("🚀 ~ file: App.tsx ~ line 160 ~ handleClick ~ depositTx", depositTx)

      setTimeout(() => {
        dispatch({
          type: "depositSuccess",
          payload: "done"
        })
      }, 20000);

    } catch (e) {
      console.log("Error on deposit with Sygma to generic", e);
    }
  };

  console.log(state);

  return (
    <div className="App">
      <div className="title">
        <div className="title-info">
          <h1>Generic Colors</h1>

          <h3>
            Connected Address:{" "}
            {state?.accountData ? state.accountData : "there is no address"}
          </h3>

          <h4>
            Balance of account:{" "}
            {state.accountDataFromSygma?.balance
              ? state.accountDataFromSygma.balance
              : "No balance"}
          </h4>
        </div>
      </div>
      <div className="main-content">
        <div className="box">
          <h4>Home Chain: {state?.homeChainUrl ? state.homeChainUrl : 'No home chain'}</h4>
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
          <h4>Destination Chain: {state?.destinationChainUrl ? state.destinationChainUrl : 'No destination chain' }</h4>
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
        <button
          onClick={handleConnectInit}
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
