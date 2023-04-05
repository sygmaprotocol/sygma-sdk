import React, { useReducer, useContext, createContext } from "react";
// import { Substrate, EVM } from "@buildwithsygma/sygma-sdk-core";
// import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// import { substrateConfig, evmSetupList } from "../config";
import { reducer, initialState, StateType } from "./state";

export type EvmContextType = {
  state: StateType;
  makeDeposit: (
    amount: string,
    address: string,
    destinationDomainId: string
  ) => Promise<void>;
};

const EvmContext = createContext<EvmContextType>({
  state: initialState,
  makeDeposit: async () => {},
});

const EvmContextProvider = (props: {
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}): JSX.Element => {
  const [state, _dispatch] = useReducer(reducer, initialState);

  function makeDeposit(
    amount: string,
    address: string,
    destinationDomainId: string
  ): Promise<void> {
    console.log("makeDeposit", amount, address, destinationDomainId);
    return Promise.resolve();
  }

  return (
    <EvmContext.Provider value={{ state, makeDeposit }}>
      {props.children}
    </EvmContext.Provider>
  );
};

const useEvm = (): EvmContextType => useContext(EvmContext);

export { EvmContextProvider, useEvm };
