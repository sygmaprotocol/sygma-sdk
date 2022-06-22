// @ts-nocheck
import { BigNumber } from "ethers";
import { Chainbridge } from "@chainsafe/chainbridge-sdk-core";

const funcDeposit = (
  destinationChainId,
  resoureId,
  depositNonce,
  user,
  data,
  handleResponse,
  tx
) => {
  console.log("");
  console.log(
    `bridge deposit event deposit nonce: ${depositNonce.toString()}, transaction hash: ${tx.transactionHash
    }`
  );
  console.log("");
  console.log("IN TRANSIT!");
};

const funcProposalEvent = async (originDomainId, despositNonce, status, dataHash, tx) => {
  console.log("");
  console.log(
    `tx receipt of proposal event`
  );
  const proposalStatus = BigNumber.from(status).toNumber();

  switch (proposalStatus) {
    case 1: {
      console.log("");
      console.log("Proposal created!!!!");
      console.log("");
    }
    case 2: {
      console.log("");
      console.log("Proposal has passed, Executing!");
      console.log("");
    }
    case 3: {
      console.log("");
      console.log("Transfer completed!!!");
      console.log("");
      // process.exit(1)
    }
    case 4: {
      console.log("");
      console.log("Transfer aborted!");
      console.log("");
    }
  }
};

const funcVoteEvent = async (
  originDomainId,
  depositNonce,
  status,
  dataHash,
  tx
) => {
  const txReceipt = await tx.getTransactionReceipt()

  console.log("txReceipt", txReceipt.status === 1 ? "Confirmed" : "Rejected")
  console.log("status", status)
  process.exit(0)
}

(async () => {
  // CHAIN 1 ADRESSES
  const bridgeSetup = {
    chain1: {
      bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
      erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
      erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
      feeHandlerAddress: "0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69",
      rpcURL: "http://localhost:8545",
      domainId: "1",
      erc20ResourceID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      decimals: 18
    },
    chain2: {
      bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
      erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
      erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
      feeHandlerAddress: "0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69",
      rpcURL: "http://localhost:8547",
      domainId: "2",
      erc20ResourceID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      decimals: 18
    },
  };

  const notEve = "0xF4314cb9046bECe6AA54bb9533155434d0c76909";

  const setup = {
    bridgeSetup,
  };

  const chainbridge = new Chainbridge(setup);
  console.log("🚀 ~ file: index.ts ~ line 101 ~ chainbridge", chainbridge)

  // const bridgeEvents = chainbridge.initializeConnection(notEve)

  // const { chain1 } = bridgeEvents

  // const { bridgeEvents: homechainBridgeEvent, proposalEvents, voteEvents } = chain1

  // const {
  //   approvalTxHash,
  //   depositTxHash,
  // } = await chainbridge.deposit(
  //   7,
  //   "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
  //   "chain1",
  //   "chain2"
  // );

  // bridgeEvents.chain1?.bridgeEvents(funcDeposit)

  // proposalEvents.chain2(funcProposalEvent)
  // voteEvents.chain2(funcVoteEvent)

})();
