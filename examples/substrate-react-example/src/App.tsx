/* eslint-disable */
import {
  useState,
  useEffect,
  createRef,
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
} from "react";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import reactLogo from "./assets/react.svg";
import "./App.css";

import { SubstrateContextProvider, useSubstrateState } from "./substrate-lib";

import UserInfo from "./UserInfo";

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState();

  const loader = (
    text:
      | string
      | number
      | boolean
      | ReactElement<any, string | JSXElementConstructor<any>>
      | ReactFragment
      | null
      | undefined
  ) => <div>{text}</div>;

  const message = (errObj: { target: { url: any } }) => (
    <div>{`Connection to websocket '${errObj.target.url}' failed.`}</div>
  );

  if (apiState === "ERROR") return message(apiError);
  else if (apiState !== "READY") return loader("Connecting to Substrate");

  if (keyringState !== "READY") {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef = createRef();

  return (
    <div className="App">
      <div ref={contextRef}>
        <h2 style={{ display: "flex", justifyContent: "center" }}>
          Minimal example Polkadot
        </h2>
        READY
        <UserInfo />
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
