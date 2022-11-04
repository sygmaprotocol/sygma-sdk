import React, { useReducer, useState } from "react";
import { ethers } from "ethers";
import { FeeDataResult, Sygma } from "@buildwithsygma/sygma-sdk-core";
import "./App.css";
import { reducer, State } from "./reducers";
import ColorsAbi from "./abis/colors-abi.json";
import { colorsAddress, bridgeAdmin } from "./bridgeSetup";
import { Connection, handleConnect } from "./hooks/connection";
import { AccountData } from "./hooks/accountData";
import { GetColors } from "./hooks/getColors";
import { useRef } from "react";
import { ColorsDestinationChainListener } from "./hooks/colorsDestinationChainListener";

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
  homeChainUrl: "",
  destinationChainUrl: "",
  loading: false,
};

function App() {
  const checkboxRefColor1 = useRef(null);
  const checkboxRefColor2 = useRef(null);
  const [nodeId, setNodeId] = useState<string | undefined>(undefined)
  const [state, dispatch] = useReducer(reducer, initState);

  const colorContractNode1 = new ethers.Contract(colorsAddress, ColorsAbi.abi);

  const colorContractNode2 = new ethers.Contract(colorsAddress, ColorsAbi.abi);

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

  /**
   * Hooks that setups listener over colors contract on destination chain
   */
  ColorsDestinationChainListener(state, dispatch);

  const handleConnectInit = () => handleConnect(state, dispatch);

  const handleClick = async () => {
    const first = state.colorSelected;
    const nodeElement = document.getElementById(nodeId!)
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
      state.accountData!.substr(2)
    }`;
    console.log(
      "🚀 ~ file: App.tsx ~ line 127 ~ handleClick ~ depositDataFee",
      depositDataFee,
    );

    const basicFeeData = await (state.sygmaInstance as Sygma).fetchBasicFeeData(
      {
        amount: "1000000",
        recipientAddress: state.accountData!,
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
      "2000000",
      state.accountData!,
      hexColor,
      false,
    );
    console.log(
      "🚀 ~ file: App.tsx ~ line 172 ~ handleClick ~ depositData",
      depositData,
    );

    dispatch({
      type: "resetColorSelected"
    });

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

      dispatch({
        type: "depositSuccess",
        payload: "init",
      });

      dispatch({
        type: "loading",
        payload: true,
      });
    } catch (e) {
      console.log("Error on deposit with Sygma to generic", e);
    }
  };

  const handleColorSelected =(colorId: string) => ({ target: { value, checked } }: any) => {
    if (checked) {
      dispatch({
        type: "selectColor",
        payload: value,
      });
    } else {
      dispatch({
        type: "resetColorSelected",
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
                    alignItems: 'center',
                    marginBottom: "10px",
                    width: 168
                  }}
                >
                  <input
                    id={`${idx}-${color}`}
                    type="checkbox"
                    onChange={handleColorSelected(`${idx}-${color}`)}
                    value={color}
                    ref={idx === 0 ? checkboxRefColor1 : checkboxRefColor2}
                    checked={state.colorSelected === color}
                  />
                  <label htmlFor={`${idx}-${color}`}>
                    {`Color: ${color}`}{" "}
                  </label>

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
      {state.loading && state.depositStatus === "init" ? (
        <span>Transferring...</span>
      ) : (
        <div className="start-button">
          <button
            onClick={handleClick}
            disabled={!state.colorSelected}
            className={!state.colorSelected ? "disabled" : "enabled"}
          >
            Start transfer
          </button>
          {!state.metamaskConnected && (
            <>
              <br />
              <button onClick={handleConnectInit} className="connect-button">
                Connect
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
