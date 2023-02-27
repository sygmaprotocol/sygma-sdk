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

const Message = (errObj: { target: { url: string } }) => (
  <div>{`Connection to websocket '${errObj.target.url}' failed.`}</div>
);

function Main() {
  const { apiState, apiError, keyringState, keyring } = useSubstrateState()!;

  if (apiState === "ERROR") return Message(apiError as { target: { url: string } });
  if (apiState !== "READY") return Loader("Connecting to Substrate");

  if (keyringState === "ERROR" && !keyring) {
    return Loader(
      "Can't get access to etensions accounts. Please authorize in extension"
    );
  }

  if (keyringState !== "READY") {
    return Loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  return (
    <div className="App">
      <div>
        <h2 className="mainTitle">
          Minimal example Polkadot
        </h2>
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
