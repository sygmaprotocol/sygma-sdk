
import React, { useReducer, useContext, useEffect } from "react";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import {
  substrateSocketConnect,
  loadAccounts,
  getNativeTokenBalance,
  getAssetBalance,
  getBasicFee,
  deposit
} from "@buildwithsygma/sygma-sdk-core";

import config from "../config";

const connectedSocket = config.provider_socket;

type State = {
  socket: any;
  jsonrpc: any | null;
  keyring: any | null;
  keyringState: any | null;
  api: any | null;
  apiError: any | null;
  apiState: string | null;
  currentAccount: any | null;
  currentAccountData: any | null;
  selectedAsset: any | null;
  selectedAssetBalance: number | null;
  selectedAssetFee: number | null;
  destinationDomainId: number;
  homeChainId: number;
  transferStatus: string | null;
  transferStatusBlock: string | null;
}
type ActionType = { type: string ; payload?: any }

/**
 * Initial state for `useReducer`
 */
const initialState: State = {
  // These are the states
  socket: connectedSocket,
  jsonrpc: {...jsonrpc},
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null,
  currentAccount: null,
  currentAccountData: null,
  selectedAsset: null,
  selectedAssetBalance: null,
  selectedAssetFee: null,
  destinationDomainId: 1,
  homeChainId: 2,
  transferStatus: null,
  transferStatusBlock: null
};

/**
 *
 * Reducer function for `useReducer`
 */
const reducer = (state: State, action: ActionType): State => {
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
    case "SET_SELECTED_ASSET":
      return { ...state, selectedAsset: action.payload };
    case "SET_CURRENT_ACCOUNT_DATA":
      return { ...state, currentAccountData: action.payload };
    case "SET_SELECTED_ASSET_BALANCE":
      return { ...state, selectedAssetBalance: action.payload };
    case "SET_ASSET_FEE":
      return { ...state, selectedAssetFee: action.payload};
    case "SET_TRANSFER_STATUS":
      return { ...state, transferStatus: action.payload};
    case "SET_TRANSFER_STATUS_BLOCK":
      return { ...state, transferStatusBlock: action.payload};
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

export type SubstrateContextType = {
  state: State;
  setCurrentAccount: (acct: any) => void;
  makeDeposit: (
    amount: string,
    address: string,
    destinationDomainId: string
  ) => void;
};
const SubstrateContext = React.createContext<SubstrateContextType| undefined>(undefined);

let keyringLoadAll = false;

const SubstrateContextProvider = (props: {
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  substrateSocketConnect(
    state,
    {
      onConnectInit: () =>
        dispatch({ type: "CONNECT_INIT", payload: undefined }),
      onConnect: (_api) => dispatch({ type: "CONNECT", payload: _api }),
      onConnectSucccess: () =>
        dispatch({ type: "CONNECT_SUCCESS", payload: undefined }),
      onConnectError: (err) =>
        dispatch({ type: "CONNECT_ERROR", payload: err }),
    }
  );



  useEffect(() => {
    const { apiState, keyringState } = state;
    if (apiState === "READY" && !keyringState && !keyringLoadAll) {
      console.log("load");
      keyringLoadAll = true;
      loadAccounts(config, state.api, {
        onLoadKeyring: () =>
          dispatch({ type: "LOAD_KEYRING", payload: undefined }),
        onSetKeyring: (_keyring) =>
          dispatch({ type: "SET_KEYRING", payload: _keyring }),
        onErrorKeyring: () =>{
          dispatch({ type: "KEYRING_ERROR", payload: undefined })
          // @ts-ignore-line
          return
        }
      });
      setSelectedAsset(config.assets[0].assetId);
    }
  }, [state, dispatch]);

  useEffect(() => {
    if (state.currentAccount && state.api) {
      getNativeTokenBalance(state.api, state.currentAccount).then(
        (accountData) => {
          dispatch({ type: "SET_CURRENT_ACCOUNT_DATA", payload: accountData });
        }
      );
    }
  }, [state.currentAccount, state.api]);

  useEffect(() => {
    if (state.selectedAsset && state.api && state.currentAccount) {
      getAssetBalance(
        state.api,
        state.selectedAsset.assetId,
        state.currentAccount
      ).then((assetBalance) => {
        dispatch({ type: "SET_SELECTED_ASSET_BALANCE", payload: assetBalance });
      });
    }
  }, [state.selectedAsset, state.api, state.currentAccount]);

  useEffect(() => {
    if (state.selectedAsset && state.api && state.destinationDomainId) {
      getBasicFee(
        state.api,
        state.destinationDomainId,
        state.selectedAsset.xsmMultiAssetId
      ).then((feeData) => {
        dispatch({ type: "SET_ASSET_FEE", payload: feeData });
      });
    }
  }, [state.selectedAsset, state.api, state.destinationDomainId]);

  function setCurrentAccount(acct: any) {
    dispatch({ type: "SET_CURRENT_ACCOUNT", payload: acct });
  }

  function setSelectedAsset(assetId: number) {
    const asset = config.assets.find((el) => el.assetId === assetId);
    dispatch({ type: "SET_SELECTED_ASSET", payload: asset });
  }

  function makeDeposit(
    amount: string,
    address: string,
    destinationDomainId: string
  ) {
    deposit(
      state.api,
      state.currentAccount,
      state.selectedAsset.xsmMultiAssetId,
      amount,
      destinationDomainId,
      address,
      {
        onInBlock: (extrensicStatus) => {
          // TODO: merge it to one action
          dispatch({ type: "SET_TRANSFER_STATUS", payload: "In block" });
          dispatch({
            type: "SET_TRANSFER_STATUS_BLOCK",
            payload: extrensicStatus.asInBlock.toString(),
          });
        },
        onFinalized: (extrensicStatus) => {
          // TODO: merge it to one action
          dispatch({ type: "SET_TRANSFER_STATUS", payload: "Finalized" });
          dispatch({
            type: "SET_TRANSFER_STATUS_BLOCK",
            payload: extrensicStatus.asFinalized.toString(),
          });
        },
      }
    );
  }

  return (
    <SubstrateContext.Provider
      value={{ state, setCurrentAccount, makeDeposit }}
    >
      {props.children}
    </SubstrateContext.Provider>
  );
};

const useSubstrate = () => useContext(SubstrateContext);
const useSubstrateState = () => useContext(SubstrateContext)?.state;

export { SubstrateContextProvider, useSubstrate, useSubstrateState };
