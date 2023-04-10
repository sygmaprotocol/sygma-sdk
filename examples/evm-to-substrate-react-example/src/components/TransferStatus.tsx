import React from "react";
import { useEvm } from "../evm-lib";

function TransferStatus(): JSX.Element {
  const {
    state: {
      transferStatus,
      transferStatusBlock,
      substrateStatus,
      proposalExecution,
    },
  } = useEvm();
  return (
    <div>
      {transferStatus && <div>EVM transfer status: {transferStatus}</div>}
      {transferStatusBlock && <div>Block: {transferStatusBlock}</div>}
      {substrateStatus && (
        <div>Substrate transfer status: {substrateStatus}</div>
      )}
      {proposalExecution && (
        <div>ProposalExecution data: {proposalExecution}</div>
      )}
    </div>
  );
}
export default TransferStatus;
