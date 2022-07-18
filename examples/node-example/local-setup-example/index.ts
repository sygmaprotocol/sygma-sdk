import { Sygma, BridgeData } from "@chainsafe/chainbridge-sdk-core";

const depositEventhandler = ({
  destinationDomainId,
  resourceId,
  depositNonce,
  user,
  data,
  handleResponse,
  tx,
}: {
  destinationDomainId: any;
  resourceId: any;
  depositNonce: any;
  user: any;
  data: any;
  handleResponse: any;
  tx: any;
}) => {
  console.log("");
  console.log(
    `bridge deposit event deposit nonce: ${depositNonce.toString()}, transaction hash: ${
      tx.transactionHash
    }`
  );
  console.log("");
  console.log("IN TRANSIT!");
};

const proposalExecutionEventHandler = async (
  originDomainId: any,
  despositNonce: any,
  dataHash: any,
  tx: any
) => {
  console.warn("Proposal execution event!")
  console.log({originDomainId, despositNonce, dataHash, tx} )
  console.warn("Transfer complete!")
};

(async () => {
  // CHAIN 1 ADRESSES
  const bridgeSetup: BridgeData = {
    chain1: {
      name: 'Local EVM 1',
      networkId: '422',
      bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
      erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
      erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
      rpcURL: "http://localhost:8545",
      domainId: "1",
      erc20ResourceID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      decimals: 18,
      feeSettings: {
        type: 'basic',
        address: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69'
      }
    },
    chain2: {
      name: 'Local EVM 2',
      networkId: '422',
      bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
      erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
      erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
      rpcURL: "http://localhost:8547",
      domainId: "2",
      erc20ResourceID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      decimals: 18,
      feeSettings: {
        type: 'basic',
        address: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69'
      }
    },
  };

  const notEve = "0xF4314cb9046bECe6AA54bb9533155434d0c76909";

  const setup = {
    bridgeSetup,
  };

  const chainbridge = new Sygma(setup);
  console.log("🚀 ~ file: index.ts ~ line 101 ~ chainbridge", chainbridge)

  chainbridge.initializeConnectionRPC(notEve)

  const basicFee = await chainbridge.fetchBasicFeeData({
    amount: "1",
    recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
  });
  console.log("🚀 ~ file: index.ts ~ line 81 ~ basicFee", basicFee)

  if (!(basicFee instanceof Error)) {
    const approvalTxReceipt = await chainbridge.approve({
      amounForApproval: "1",
    });
    console.log("🚀 ~ file: index.ts ~ line 89 ~ approvalTxReceipt", approvalTxReceipt)

    const depositTxReceipt = await chainbridge.deposit({
      amount: "1",
      recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
      feeData: basicFee.feeData,
    });

    console.log("🚀 ~ file: index.ts ~ line 91 ~ depositReceipt", depositTxReceipt)

    chainbridge.createHomeChainDepositEventListener(depositEventhandler)

    chainbridge.destinationProposalExecutionEventListener(proposalExecutionEventHandler)
  }

})();
