import React from "react";
import { useSubstrateState } from "../substrate-lib";


function TransferStatus() {
  const {transferStatus, transferStatusBlock} = useSubstrateState()
  return(<div>
    {transferStatus && <div>Transfer status: {transferStatus}</div>}
    {transferStatusBlock && <div>Block: {transferStatusBlock}</div>}
  </div>)
}
export default TransferStatus