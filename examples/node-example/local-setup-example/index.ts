import { Sygma, BridgeData, SygmaBridgeSetupList } from "@buildwithsygma/sygma-sdk-core";

const depositEventLogs = (
  destinationDomainId: any,
  resourceId: any,
  depositNonce: any,
  user: any,
  data: any,
  handleResponse: any,
  tx: any
) => {
  console.log(
    `bride deposit event deposit nonce: ${depositNonce.toString()} to contract with ResourceId: ${resourceId}`
  );
  console.log(` transaction hash: ${tx.transactionHash}`);
  console.info("Deposit in transit!");
};

const proposalExecutionEventsLogs = async (
  originDomainId: any,
  despositNonce: any,
  dataHash: any,
  tx: any
) => {
  console.warn("Proposal execution event!");
  console.log({ originDomainId, despositNonce, dataHash, tx });
  console.warn("Transfer complete!");
};

(async () => {
  // CHAIN 1 ADRESSES
  const bridgeSetupList: SygmaBridgeSetupList = [
    {
      domainId: "1",
      networkId: 1337,
      name: "Local EVM 1",
      decimals: 18,
      bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
      erc20HandlerAddress: "0x1ED1d77911944622FCcDDEad8A731fd77E94173e",
      erc721HandlerAddress: "0x481f97f9C82a971B3844a422936a4d3c4082bF84",
      rpcUrl: "http://localhost:8545",
      tokens: [
        {
          type: "erc20",
          address: "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A",
          name: "ERC20LRTST",
          symbol: "ETHIcon",
          imageUri: "ETHIcon",
          decimals: 18,
          resourceId:
            "0x0000000000000000000000000000000000000000000000000000000000000300",
          feeSettings: {
            type: "basic",
            address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
          },
        },
      ],
    },
    {
      domainId: "2",
      networkId: 1338,
      name: "Local EVM 2",
      decimals: 18,
      bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
      erc20HandlerAddress: "0x1ED1d77911944622FCcDDEad8A731fd77E94173e",
      erc721HandlerAddress: "0x481f97f9C82a971B3844a422936a4d3c4082bF84",
      rpcUrl: "http://localhost:8547",
      tokens: [
        {
          type: "erc20",
          address: "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A",
          name: "ERC20LRTST",
          symbol: "ETHIcon",
          imageUri: "ETHIcon",
          decimals: 18,
          resourceId:
            "0x0000000000000000000000000000000000000000000000000000000000000300",
          feeSettings: {
            type: "basic",
            address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
          },
        },
      ],
    },
  ];

  const notEve = "0xF4314cb9046bECe6AA54bb9533155434d0c76909";

  const setup = {
    bridgeSetupList,
  };

  const sygma = new Sygma(setup);
  console.log("🚀 ~ file: index.ts ~ line 101 ~ sygma", sygma)

  sygma.initializeConnectionRPC(notEve)

  const basicFee = await sygma.fetchBasicFeeData({
    amount: "1",
    recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
  });
  console.log("🚀 ~ file: index.ts ~ line 81 ~ basicFee", basicFee)

  if (!(basicFee instanceof Error)) {
    const approvalTxReceipt = await sygma.approve({
      amountOrIdForApproval: "1",
    });
    console.log("🚀 ~ file: index.ts ~ line 89 ~ approvalTxReceipt", approvalTxReceipt)

    const depositTxReceipt = await sygma.deposit({
      amount: "1",
      recipientAddress: "0xF4314cb9046bECe6AA54bb9533155434d0c76909",
      feeData: basicFee,
    });

    console.log("🚀 ~ file: index.ts ~ line 91 ~ depositReceipt", depositTxReceipt)

    const depositEvent = await sygma.getDepositEventFromReceipt(depositTxReceipt!)
    const { depositNonce } = depositEvent.args;
    console.log("Deposit Nonce:", depositNonce)


    sygma.createHomeChainDepositEventListener(depositEventLogs)

    sygma.destinationProposalExecutionEventListener(depositNonce.toNumber(), proposalExecutionEventsLogs)
  }

})();
