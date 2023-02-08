// @ts-nocheck
import React, { useReducer, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { TypeRegistry } from "@polkadot/types/create";
import { BN } from "@polkadot/util";


import {
  substrateSocketConnect,
  loadAccounts,
  getNativeTokenBalance,
  getAssetBalance,
  getBasicFee,
  deposit
} from "@buildwithsygma/sygma-sdk-core";

import config, { SubstrateConfigAssetType } from "../config";

const connectedSocket = config.provider_socket;
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
  currentAccountData: null,
  selectedAsset: null,
  selectedAssetBalance: null,
  selectedAssetFee: null,
  destinationDomainId: 1,
  homeChainId: 2,
  transferStatus: null,
  transferStatusBlock: null
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
      console.log('load')
      keyringLoadAll = true;
      loadAccounts(config, state, dispatch);
      setSelectedAsset(config.assets[0].assetId)
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
      getAssetBalance(state.api, state.selectedAsset.assetId, state.currentAccount).then(assetBalance => {
        dispatch({type: 'SET_SELECTED_ASSET_BALANCE', payload: assetBalance})
      })
    }
  }, [state.selectedAsset, state.api, state.currentAccount])

  useEffect(() => {
    if (state.selectedAsset && state.api && state.destinationDomainId) {
      getBasicFee(state.api, state.destinationDomainId, state.selectedAsset.xsmMultiAssetId).then(feeData => {
        dispatch({type: 'SET_ASSET_FEE', payload: feeData})
      })
    }
  }, [state.selectedAsset, state.api, state.destinationDomainId])

  function setCurrentAccount(acct: any) {
    dispatch({ type: "SET_CURRENT_ACCOUNT", payload: acct });
  }

  function setSelectedAsset(assetId: number) {
    const asset = config.assets.find(el => el.assetId === assetId)
    dispatch({ type: "SET_SELECTED_ASSET", payload: asset })
  }

  function makeDeposit(amount: string, address: string, destinationDomainId: string) {
    deposit(
      state.api,
      state.currentAccount,
      state.selectedAsset.xsmMultiAssetId,
      amount,
      destinationDomainId,
      address,
      dispatch
    );
  }

  return (
    <SubstrateContext.Provider value={{ state, setCurrentAccount, makeDeposit }}>
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
