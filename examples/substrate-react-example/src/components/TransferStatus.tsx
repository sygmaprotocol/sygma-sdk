import React from "react";
import { useSubstrateState } from "../substrate-lib";

function TransferStatus() {
  const { transferStatus, transferStatusBlock, evmStatus, proposalExecution } =
    useSubstrateState();
  return (
    <div>
      {transferStatus && <div>Substrate transfer status: {transferStatus}</div>}
      {transferStatusBlock && <div>Block: {transferStatusBlock}</div>}
      {evmStatus && <div>EVM transfer status: {evmStatus}</div>}
      {proposalExecution && (
        <div>ProposalExecution tx: {proposalExecution}</div>
      )}
    </div>
  );
}
export default TransferStatus;
