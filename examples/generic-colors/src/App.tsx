import { useReducer, useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import { FeeDataResult } from "@buildwithsygma/sygma-sdk-core";
import "./App.css";
import { reducer, State } from "./reducers";
import { bridgeAdmin } from "./bridgeSetup";
import { useConnection, handleConnect } from "./hooks/connection";
import { useAccountData } from "./hooks/accountData";
import { useGetColors } from "./hooks/getColors";
import { useColorsDestinationChainListener } from "./hooks/colorsDestinationChainListener";

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
  colorsAddresses: { colorsAddressNode1: "", colorsAddressNode2: "" },
};

function App() {
  const checkboxRefColor1 = useRef(null);
  const checkboxRefColor2 = useRef(null);
  const [nodeId, setNodeId] = useState<string | undefined>(undefined);
  const [state, dispatch] = useReducer(reducer, initState);

  /**
   * Initialization of hooks for data and connection using Sygma SDK
   */
  useConnection(state, dispatch);

  /**
   * Hook that gets data from the account
   */
  useAccountData(state, dispatch);

  /**
   * Hook that gets the colors from the Colors contract
   */
  useGetColors(state, dispatch);

  /**
   * Hooks that setups listener over colors contract on destination chain
   */
  useColorsDestinationChainListener(state, dispatch);

  const handleConnectInit = (): void => handleConnect(state, dispatch);

  /**
   * This function handles the logic of performign the generic deposit
   * For this it gets the data to transfer: the hex format of the color
   * Then it gets the fee data for the deposit using the fetchBaiscFeeData method from the Sygma class
   * Then it formats the deposit data using the formatPermissionlessGenericDepositData method from the Sygma class
   * Note that the method requires you to pass the function signature of the method you want to call on the contract that's deployed over the destination chain
   * It also uses the address of the contract. Since this example is using local setup, addresses are the same, hence it uses the same address for the first node
   * We also pass the max fee value that we want to pay for the transaction, alongside the recipient address, the actual data to transfer and a boolean flag for depositor check
   * Finally we call the depositGeneric method from the Sygma class, passing the resource id of the colors contract, the deposit data and the fee data
   */
  const handleClick = async (): Promise<void> => {
    const first = state.colorSelected;
    const nodeElement = document.getElementById(nodeId!);
    const formatedHex = first?.substring(1);
    const depositFunctionSignature = "0x103b854b";
    const colorsResouceId =
      "0x0000000000000000000000000000000000000000000000000000000000000500";

    const { accountData = "" } = state;

    const basicFeeData = await state.sygmaInstance?.fetchBasicFeeData({
      amount: "1000000",
      recipientAddress: accountData,
    });

    const hexColor: string =
      state.sygmaInstance?.toHex(`0x${formatedHex}`, 32) || "";

    const depositData: string =
      state.sygmaInstance?.formatPermissionlessGenericDepositData(
        depositFunctionSignature,
        state.colorsAddresses.colorsAddressNode1 as string,
        "2000000",
        accountData,
        hexColor,
        false,
      ) || "";

    dispatch({
      type: "resetColorSelected",
    });

    try {
      await state.sygmaInstance?.depositGeneric(
        colorsResouceId,
        depositData,
        basicFeeData as FeeDataResult,
      );

      dispatch({
        type: "depositSuccess",
        payload: "init",
      });

      (nodeElement as HTMLInputElement).checked = false;

      dispatch({
        type: "loading",
        payload: true,
      });
    } catch (e) {
      console.log("Error on deposit with Sygma to generic", e);
    }
  };

  const handleColorSelected =
    (colorId: string) =>
    ({ target: { value, checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setNodeId(colorId);
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
                    id={`${idx}-${color}`}
                    type="checkbox"
                    onChange={handleColorSelected(`${idx}-${color}`)}
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
