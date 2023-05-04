import { useState } from "react";
import "./App.css";

import { EvmContextProvider, useEvm } from "./evm-lib";

import UserInfo from "./components/UserInfo";
import Form from "./components/Form";
import TransferStatus from "./components/TransferStatus";
import EnviromentSelect from "./components/EnviromentSelect";

const Loader = (text: string): JSX.Element => <div>{text}</div>;

function Main(): JSX.Element {
  const {
    state: { signer },
  } = useEvm();

  if (!signer) {
    return Loader("Please connect with MetaMask");
  }

  return (
    <div className="App">
      <div>
        <h2 className="mainTitle">Minimal example Evm to Substrate</h2>
        <EnviromentSelect />

        <UserInfo />
        <Form />
        <TransferStatus />
      </div>
    </div>
  );
}

function App(props: JSX.IntrinsicAttributes): JSX.Element {
  return (
    <EvmContextProvider>
      <Main {...props} />
    </EvmContextProvider>
  );
}

export default App;
