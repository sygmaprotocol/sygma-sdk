import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
} from "react";
import "./App.css";

import { SubstrateContextProvider, useSubstrateState } from "./substrate-lib";

import UserInfo from "./components/UserInfo";
import Form from "./components/Form";
import TransferStatus from "./components/TransferStatus"

const Loader = (
  text:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | null
    | undefined
) => <div>{text}</div>;

const Message = (errObj: { target: { url: any } }) => (
  <div>{`Connection to websocket '${errObj.target.url}' failed.`}</div>
);

function Main() {
  const { apiState, apiError, keyringState, keyring } = useSubstrateState()!;

  if (apiState === "ERROR") return Message(apiError);
  if (apiState !== "READY") return Loader("Connecting to Substrate");

  if (keyringState !== "READY") {
    return Loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  if (keyringState === "ERROR" && !keyring) {
    return Loader(
      "Can't get access to etensions accounts. Please authorize in extension"
    );
  }

  return (
    <div className="App">
      <div>
        <h2 style={{ display: "flex", justifyContent: "center" }}>
          Minimal example Polkadot
        </h2>
        READY
        <UserInfo />
        <Form />
        <br />
        <TransferStatus />
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
