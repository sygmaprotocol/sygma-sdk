import React, { useReducer } from "react";
import { NonceManager } from "@ethersproject/experimental";
import { ethers } from "ethers";
import { FeeDataResult, Sygma } from "@buildwithsygma/sygma-sdk-core";
import "./App.css";
import { reducer, State } from "./reducers";
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
import { useRef } from "react";

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

const walletSignerNode2 = walletNode2.connect(providerNode2);

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
  depositStatus: "none",
  colorSelected: undefined,
  sygmaInstance: undefined,
  homeChainUrl: '',
  destinationChainUrl: ''
};

function App() {
  const checkboxRefColor1 = useRef(null)
  const checkboxRefColor2 = useRef(null)
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
  GetColors(state, dispatch, colorContractNode1, colorContractNode2);

  const handleConnectInit = () => handleConnect(state, dispatch);

  const handleClick = async () => {
    const first = state.colorSelected;
    const formatedHex = first!.substr(1);
    const depositFunctionSignature = "0x103b854b";
    const colorsResouceId =
      "0x0000000000000000000000000000000000000000000000000000000000000500";
    console.log(
      "🚀 ~ file: App.tsx ~ line 148 ~ handleClick ~ first",
      formatedHex,
    );
    
    const depositDataFee = `0x${
      // @ts-ignore-next-line
      ethers.utils.hexZeroPad(100, 32).substr(2) +
      // @ts-ignore-next-line
      ethers.utils.hexZeroPad(bridgeAdmin.length, 32).substr(2) +
      (await managedSignerNode1.getAddress()).substr(2)
    }`;
    console.log(
      "🚀 ~ file: App.tsx ~ line 127 ~ handleClick ~ depositDataFee",
      depositDataFee,
    );

    const basicFeeData = await (state.sygmaInstance as Sygma).fetchBasicFeeData(
      {
        amount: "1000000",
        recipientAddress: bridgeAdmin,
      },
    );
    console.log(
      "🚀 ~ file: App.tsx ~ line 169 ~ handleClick ~ basicFeeData",
      basicFeeData,
    );

    const hexColor = state?.sygmaInstance!.toHex(`0x${formatedHex}`, 32);

    const depositData = state?.sygmaInstance!.createGenericDepositDataV1(
      depositFunctionSignature,
      colorsAddress,
      2000000,
      bridgeAdmin,
      hexColor,
      false,
    );
    console.log(
      "🚀 ~ file: App.tsx ~ line 172 ~ handleClick ~ depositData",
      depositData,
    );

    try {
      const depositTx = await state?.sygmaInstance!.depositGeneric(
        colorsResouceId,
        depositData,
        basicFeeData as FeeDataResult,
      );
      console.log(
        "🚀 ~ file: App.tsx ~ line 160 ~ handleClick ~ depositTx",
        depositTx,
      );

      if((checkboxRefColor1.current as any).value === state.colorSelected){
        (checkboxRefColor1.current as any).checked = false
      } else if ((checkboxRefColor2.current as any).value === state.colorSelected){
        (checkboxRefColor2.current as any).checked = false
      }

      setTimeout(() => {
        dispatch({
          type: "depositSuccess",
          payload: "done",
        });
      }, 20000);
    } catch (e) {
      console.log("Error on deposit with Sygma to generic", e);
    }
  };

  const handleColorSelected = ({ target: { value, checked }}: any) => {
    if (checked) {
      dispatch({
        type: "selectColor",
        payload: value,
      });
    }
  };

  console.log(state);

  return (
    <div className="App">
      <div className="title">
        <div className="title-info">
          <h1>Sygma Generic Colors</h1>

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
          <h4>
            Home Chain:{" "}
            {state?.homeChainUrl ? state.homeChainUrl : "No home chain"}
          </h4>
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
                  <input
                    type="checkbox"
                    onClick={handleColorSelected}
                    value={color}
                    ref={idx === 0 ? checkboxRefColor1 : checkboxRefColor2}
                  />
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
          <h4>
            Destination Chain:{" "}
            {state?.destinationChainUrl
              ? state.destinationChainUrl
              : "No destination chain"}
          </h4>
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
        <button onClick={handleClick}>Start transfer</button>
        {!state.metamaskConnected && (
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
        )}
      </div>
    </div>
  );
}

export default App;
