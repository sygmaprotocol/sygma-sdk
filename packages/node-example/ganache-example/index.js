import { ethers, BigNumber } from "ethers";
import { Chainbridge } from "@chainsafe/chainbridge-sdk";

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
    `bride deposit event deposit nonce: ${depositNonce.toString()}, transaction hash: ${tx.transactionHash
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
  // console.log(await tx.getTransactionReceipt())
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
      process.exit(1)
    }
    case 4: {
      console.log("");
      console.log("Transfer aborted!");
      console.log("");
      process.exit(1)
    }
  }
};

(async () => {
  // CHAIN 1 ADRESSES
  const bridgeSetup = {
    chain1: {
      bridgeAddress: "0x62877dDCd49aD22f5eDfc6ac108e9a4b5D2bD88B",
      erc20Address: "0x21605f71845f372A9ed84253d2D024B7B10999f4",
      erc20HandlerAddress: "0x3167776db165D8eA0f51790CA2bbf44Db5105ADF",
      rpcURL: "http://localhost:8544",
      domainId: "23",
      erc20ResourceID:
        "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69500",
      decimals: 18
    },
    chain2: {
      bridgeAddress: "0x62877dDCd49aD22f5eDfc6ac108e9a4b5D2bD88B",
      erc20Address: "0x21605f71845f372A9ed84253d2D024B7B10999f4",
      erc20HandlerAddress: "0x3167776db165D8eA0f51790CA2bbf44Db5105ADF",
      rpcURL: "http://localhost:8553",
      domainId: "24",
      erc20ResourceID:
        "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69500",
      decimals: 18
    },
  };

  const eve = "0x4CEEf6139f00F9F4535Ad19640Ff7A0137708485";
  const notEve = "0xF4314cb9046bECe6AA54bb9533155434d0c76909";

  const setup = {
    bridgeSetup,
  };

  const chainbridge = new Chainbridge(setup);

  const bridgeEvents = chainbridge.initializeConnection(notEve)

  console.log("token supplies", await chainbridge.hasTokenSupplies(2, "chain2"))

  console.log("check current allowance", await chainbridge.checkCurrentAllowance("chain1", notEve))

  console.log("EIP1559", await chainbridge.isEIP1559MaxFeePerGas(0, "chain1"))

  // const { chain1: { bridgeEvents: br, proposalEvents } } = bridgeEvents

  // console.log("proposalEvent", proposalEvents)

  // br(funcDeposit)
  // proposalEvents.chain2(funcProposalEvent)

  const {
    approvalTxHash,
    depositTxHash,
  } = await chainbridge.transferERC20(
    7,
    "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
    "chain1",
    "chain2"
  );

  // console.log("hashes:::", approvalTxHash, depositTxHash)

  bridgeEvents["chain1"](funcDeposit);

  destinationProposalEvents(funcProposalEvent);

  // IN GANACHE IT DOESNT MATTER THIS. THE RECEIPTS ARE UNDEFINED
  // const receiptApproval = await chainbridge.waitForTransactionReceipt(
  //   approvalTxHash
  // );

  // const receiptDeposit = await chainbridge.waitForTransactionReceipt(
  //   depositTxHash
  // );

  // console.log("-----------APPROVAL RECEIPT------------------------------------")
  // console.log("---------------------------------------------------------------")
  // console.log(receiptApproval)
  // console.log("")
  // console.log("")
  // console.log("")

  // console.log("----------------DEPOSIT RECEIPT--------------------------------")
  // console.log("---------------------------------------------------------------")
  // console.log(receiptDeposit)
})();
