import React, { useEffect, useState } from "react";
// import { formatBalance } from "@polkadot/util";
// import { useSubstrateState, useSubstrate } from "../substrate-lib";
// import { substrateConfig } from "../config";

function Main(): JSX.Element {
  return (
    <div>
      <h1>Evm Account Info</h1>
    </div>
  );
}

export default function UserInfo(
  props: JSX.IntrinsicAttributes
): JSX.Element | null {
  // const state = useSubstrateState();
  // const api = state?.api;
  // return api?.rpc && api.rpc.state ? <Main {...props} /> : null;
  return <Main {...props} />;
}
