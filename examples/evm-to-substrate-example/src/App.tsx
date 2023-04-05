import { useState } from "react";
import "./App.css";

import { EvmContextProvider, useEvm } from "./evm-lib";

import UserInfo from "./components/UserInfo";

function Main(): JSX.Element {

  return (
    <div className="App">
      <UserInfo />
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
