// @ts-nocheck
import React, { useReducer, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { TypeRegistry } from "@polkadot/types/create";

import { substrateSocketConnect, loadAccounts} from "@buildwithsygma/sygma-sdk-core"

import config from "../config";

const connectedSocket = config.PROVIDER_SOCKET;
/**
 * Initial state for `useReducer`
 */
const initialState = {
  // These are the states
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc, ...config.CUSTOM_RPC_METHODS },
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null,
  currentAccount: null,
};

const registry = new TypeRegistry();

/**
 *
 * Reducer function for `useReducer`
 */
const reducer = (state: any, action: { type: any; payload: any; }) => {
  switch (action.type) {
    case "CONNECT_INIT":
      return { ...state, apiState: "CONNECT_INIT" };
    case "CONNECT":
      return { ...state, api: action.payload, apiState: "CONNECTING" };
    case "CONNECT_SUCCESS":
      return { ...state, apiState: "READY" };
    case "CONNECT_ERROR":
      return { ...state, apiState: "ERROR", apiError: action.payload };
    case "LOAD_KEYRING":
      return { ...state, keyringState: "LOADING" };
    case "SET_KEYRING":
      return { ...state, keyring: action.payload, keyringState: "READY" };
    case "KEYRING_ERROR":
      return { ...state, keyring: null, keyringState: "ERROR" };
    case "SET_CURRENT_ACCOUNT":
      return { ...state, currentAccount: action.payload };
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

const SubstrateContext = React.createContext(undefined);

let keyringLoadAll = false;

const SubstrateContextProvider = (props: { [x: string]: any; }) => {
  const neededPropNames = ["socket"];
  neededPropNames.forEach((key) => {
    initialState[key] =
      typeof props[key] === "undefined" ? initialState[key] : props[key];
  });

  const [state, dispatch] = useReducer(reducer, initialState);
  substrateSocketConnect(state, dispatch)

  useEffect(() => {
    const { apiState, keyringState } = state;
    if (apiState === "READY" && !keyringState && !keyringLoadAll) {
      keyringLoadAll = true;
      loadAccounts(config, state, dispatch);
    }
  }, [state, dispatch]);

  function setCurrentAccount(acct: any) {
    dispatch({ type: "SET_CURRENT_ACCOUNT", payload: acct });
  }

  return (
    <SubstrateContext.Provider value={{ state, setCurrentAccount }}>
      {props.children}
    </SubstrateContext.Provider>
  );
};

// TODO: replace by proper type
SubstrateContextProvider.propTypes = {
  socket: PropTypes.string,
};

const useSubstrate = () => useContext(SubstrateContext);
const useSubstrateState = () => useContext(SubstrateContext).state;

export { SubstrateContextProvider, useSubstrate, useSubstrateState };
