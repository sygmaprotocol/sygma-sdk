import { BigNumber, Event } from "ethers";
import { Sygma, EvmBridgeSetupList } from "@buildwithsygma/sygma-sdk-core";

const depositEventLogs = (
  destinationDomainId: number,
  resourceId: string,
  depositNonce: BigNumber,
  user: string,
  data: string,
  handleResponse: any,
  tx: Event
): void => {
  console.log(
    `bride deposit event deposit nonce: ${depositNonce.toString()} to contract with ResourceId: ${resourceId}`
  );
  console.log(` transaction hash: ${tx.transactionHash}`);
  console.info("Deposit in transit!");
};

const proposalExecutionEventsLogs = (
  originDomainId: number,
  despositNonce: BigNumber,
  dataHash: string,
  tx: Event
): void => {
  console.warn("Proposal execution event!");
  console.log({ originDomainId, despositNonce, dataHash, tx });
  console.warn("Transfer complete!");
};

void (async () => {
  // CHAIN 1 ADRESSES
  const bridgeSetupList: EvmBridgeSetupList = [
    {
      domainId: "1",
      networkId: 1337,
      name: "Local EVM 1",
      decimals: 18,
      bridgeAddress: "0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68",
      erc20HandlerAddress: "0x02091EefF969b33A5CE8A729DaE325879bf76f90",
      erc721HandlerAddress: "0xC2D334e2f27A9dB2Ed8C4561De86C1A00EBf6760",
      rpcUrl: "http://localhost:8545",
      tokens: [
        {
          type: "erc20",
          address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
          name: "ERC20LRTST",
          symbol: "ETHIcon",
          imageUri: "ETHIcon",
          decimals: 18,
          resourceId:
            "0x0000000000000000000000000000000000000000000000000000000000000300",
          feeSettings: {
            type: "basic",
            address: "0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94",
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
      erc20HandlerAddress: "0x02091EefF969b33A5CE8A729DaE325879bf76f90",
      erc721HandlerAddress: "0x481f97f9C82a971B3844a422936a4d3c4082bF84",
      rpcUrl: "http://localhost:8547",
      tokens: [
        {
          type: "erc20",
          address: "0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6",
          name: "ERC20LRTST",
          symbol: "ETHIcon",
          imageUri: "ETHIcon",
          decimals: 18,
          resourceId:
            "0x0000000000000000000000000000000000000000000000000000000000000300",
          feeSettings: {
            type: "basic",
            address: "0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94",
          },
        },
      ],
    },
  ];

  const notEve = "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b";

  const setup = {
    bridgeSetupList,
  };

  const sygma = new Sygma(setup);
  sygma.bridgeSetup = {
    chain1: sygma.selectHomeNetwork(1338)!,
    chain2: sygma.selectOneForDestination(1338)!,
  };
  console.log("🚀 ~ file: index.ts ~ line 101 ~ sygma", sygma);

  sygma.initializeConnectionRPC(notEve);

  const basicFee = await sygma.fetchBasicFeeData({
    amount: "1",
    recipientAddress: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
  });
  console.log("🚀 ~ file: index.ts ~ line 81 ~ basicFee", basicFee);

  if (!(basicFee instanceof Error)) {
    const approvalTxReceipt = await sygma.approve({
      amountOrIdForApproval: "1",
    });
    console.log(
      "🚀 ~ file: index.ts ~ line 89 ~ approvalTxReceipt",
      approvalTxReceipt
    );

    const depositTxReceipt = await sygma.deposit({
      amount: "1",
      recipientAddress: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
      feeData: basicFee,
    });

    console.log(
      "🚀 ~ file: index.ts ~ line 91 ~ depositReceipt",
      depositTxReceipt
    );
    if (depositTxReceipt) {
      const depositEvent = await sygma.getDepositEventFromReceipt(
        depositTxReceipt
      );
      const { depositNonce } = depositEvent.args;
      console.log("Deposit Nonce:", depositNonce);

      void sygma.createHomeChainDepositEventListener(depositEventLogs);

      sygma.destinationProposalExecutionEventListener(
        depositNonce.toNumber(),
        proposalExecutionEventsLogs
      );
    }
  }
})();
