import React, { useReducer, useContext, useEffect } from "react";
import { Substrate, EVM } from "@buildwithsygma/sygma-sdk-core";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { substrateConfig, evmSetupList } from "../config";
import { reducer, initialState, StateType } from './state';

const {
  substrateSocketConnect,
  loadAccounts,
  getNativeTokenBalance,
  getAssetBalance,
  getBasicFee,
  deposit,
} = Substrate;

const {
  createProposalExecutionEventListener,
  removeProposalExecutionEventListener,
  connectToBridge,
  getProviderByRpcUrl,
} = EVM;

export type SubstrateContextType = {
  state: StateType;
  setCurrentAccount: (acct: unknown) => void;
  makeDeposit: (
    amount: string,
    address: string,
    destinationDomainId: string
  ) => Promise<void>;
};
const SubstrateContext = React.createContext<SubstrateContextType>({
  state: initialState,
  setCurrentAccount: (acct) => {},
  makeDeposit: async (...args) => {},
});

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
  substrateSocketConnect(state, {
    onConnectInit: () => dispatch({ type: "CONNECT_INIT", payload: undefined }),
    onConnect: (_api) => dispatch({ type: "CONNECT", payload: _api }),
    onConnectSucccess: () =>
      dispatch({ type: "CONNECT_SUCCESS", payload: undefined }),
    onConnectError: (err) => dispatch({ type: "CONNECT_ERROR", payload: err }),
  });

  useEffect(() => {
    const { apiState, keyringState, api } = state;
    if (apiState === "READY" && api && !keyringState && !keyringLoadAll) {
      console.log("load");
      keyringLoadAll = true;
      loadAccounts(substrateConfig, api, {
        onLoadKeyring: () =>
          dispatch({ type: "LOAD_KEYRING", payload: undefined }),
        onSetKeyring: (_keyring) =>
          dispatch({ type: "SET_KEYRING", payload: _keyring }),
        onErrorKeyring: () => {
          dispatch({ type: "KEYRING_ERROR", payload: undefined });
        },
      });
      setSelectedAsset(substrateConfig.assets[0].assetId);
    }
  }, [state.apiState, state.api, dispatch]);

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

  function setCurrentAccount(acct: unknown) {
    dispatch({ type: "SET_CURRENT_ACCOUNT", payload: (acct as InjectedAccountWithMeta) });
  }

  function setSelectedAsset(assetId: number) {
    const asset = substrateConfig.assets.find((el) => el.assetId === assetId);
    dispatch({ type: "SET_SELECTED_ASSET", payload: asset });
  }

  useEffect(() => {
    if (state.depositNonce !== null) {
      const evmBridgeConfig = evmSetupList.find(
        (el) => el.domainId === state.destinationDomainId.toString()
      );
      if (evmBridgeConfig) {
        const evmProvider = getProviderByRpcUrl(evmBridgeConfig.rpcUrl);
        const evmBridgeContract = connectToBridge(
          evmBridgeConfig.bridgeAddress,
          evmProvider
        );
        console.log("Set listener for ProposalExecution event");
        createProposalExecutionEventListener(
          state.depositNonce,
          evmBridgeContract,

          (originDomainId, depositNonce, dataHash, tx) => {
            console.log(
              "execution events callback",
              originDomainId,
              depositNonce,
              dataHash,
              tx
            );
            dispatch({
              type: "SET_PROPOSAL_EXECUTION_BLOCK",
              payload: tx.transactionHash,
            });
            removeProposalExecutionEventListener(evmBridgeContract);
          }
        );
      }
    }
  }, [state.depositNonce]);

  function makeDeposit(
    amount: string,
    address: string,
    destinationDomainId: string
  ) {
    return deposit(
      state.api!,
      state.currentAccount!,
      state.selectedAsset!.xsmMultiAssetId,
      amount,
      destinationDomainId,
      address,
      {
        onInBlock: (extrensicStatus) => {
          dispatch({ type: "SET_TRANSFER_STATUS", payload: "In block" });
          dispatch({
            type: "SET_TRANSFER_STATUS_BLOCK",
            payload: extrensicStatus.asInBlock.toString(),
          });
        },
        onFinalized: (extrensicStatus) => {
          dispatch({ type: "SET_TRANSFER_STATUS", payload: "Finalized" });
          dispatch({
            type: "SET_TRANSFER_STATUS_BLOCK",
            payload: extrensicStatus.asFinalized.toString(),
          });
        },
        onDepositEvent: (depositData) => {
          dispatch({
            type: "SET_DEPOSIT_NONCE",
            payload: Number(depositData.depositNonce),
          });
          dispatch({
            type: "SET_EVM_STATUS",
            payload: `Awaiting for ProposalExecution event for depositNonce: ${depositData.depositNonce}`,
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
const useSubstrateState = () => useContext(SubstrateContext).state;

export { SubstrateContextProvider, useSubstrate, useSubstrateState };
