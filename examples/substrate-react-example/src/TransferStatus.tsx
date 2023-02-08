import React from "react";
import { useSubstrateState, useSubstrate } from "./substrate-lib";


function Main(props: any) {
  const {transferStatus, transferStatusBlock} = useSubstrateState()
  return(<div>
    {transferStatus && <div>Transfer status: {transferStatus}</div>}
    {transferStatusBlock && <div>Block: {transferStatusBlock}</div>}
  </div>)
}
export default Main