import React, {
  CSSProperties,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { BigNumber, utils, constants } from "ethers";
import { useForm } from "react-hook-form";
import {
  Sygma,
  BridgeData,
  SygmaBridgeSetupList,
  BridgeEvents,
  FeeDataResult
} from "@buildwithsygma/sygma-sdk-core";

const bridgeSetupList: SygmaBridgeSetupList = [
  {
    domainId: "1",
    networkId: 422,
    name: "Local EVM 1",
    decimals: 18,
    bridgeAddress: "0xF75ABb9ABED5975d1430ddCF420bEF954C8F5235",
    erc20HandlerAddress: "0x7ec51Af51bf6f6f4e3C2E87096381B2cf94f6d74",
    erc721HandlerAddress: "0x1cd88Fa5848389E4027d29B267BAB561300CEA2A",
    rpcUrl: "http://localhost:8545",
    tokens: [
      {
        type: "erc721",
        address: "0xd6D787253cc022E6839583aD0cBECfc9c60b581c",
        name: "NFT",
        symbol: "NFT",
        imageUri: "ETHIcon",
        decimals: 0,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000200",
        feeSettings: {
          type: "basic",
          address: "0xA8254f6184b82D7307257966b95D7569BD751a90",
        },
      },
    ],
  },
  {
    domainId: "2",
    networkId: 1214,
    name: "Local EVM 2",
    decimals: 18,
    bridgeAddress: "0xF75ABb9ABED5975d1430ddCF420bEF954C8F5235",
    erc20HandlerAddress: "0x7ec51Af51bf6f6f4e3C2E87096381B2cf94f6d74",
    erc721HandlerAddress: "0x1cd88Fa5848389E4027d29B267BAB561300CEA2A",
    rpcUrl: "http://localhost:8547",
    tokens: [
      {
        type: "erc721",
        address: "0xd6D787253cc022E6839583aD0cBECfc9c60b581c",
        name: "NFT",
        symbol: "NFT",
        imageUri: "ETHIcon",
        decimals: 0,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000200",
        feeSettings: {
          type: "basic",
          address: "0xA8254f6184b82D7307257966b95D7569BD751a90",
        },
      },
    ],
  },
];

const feeOracleSetup = {
  feeOracleBaseUrl: "http://localhost:8091",
  feeOracleHandlerAddress: "0xa9ddD97e1762920679f3C20ec779D79a81903c0B",
};

const notEve = "0xF4314cb9046bECe6AA54bb9533155434d0c76909";

type LocalData = {
  balance: BigNumber;
  address: string;
  gasPrice: BigNumber;
  balanceOfTokens: BigNumber;
  tokenName: string;
};

type SygmaData = { chain1: BridgeEvents; chain2: BridgeEvents };

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

function App() {
  const [data, setData] = useState<SygmaData | undefined>(
    undefined
  );

  const [sygmaInstance, setSygmaInstance] = useState<Sygma | undefined>(undefined);
  const [tokenList, setTokenList]  = useState<[string]>()
  const [homeDepositNonce, setHomeDepositNonce] = useState<number | undefined>(undefined)
  const [accountData, setAccountData] = useState<LocalData | undefined>(undefined);
  const [metaIsConnected, setMetaIsConnected] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [logicConnected, setLogicConnected] = useState<boolean>(
    false
  );
  const [customFee, setCustomFee] = useState<FeeDataResult>();


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "1",
      address: "0x4CEEf6139f00F9F4535Ad19640Ff7A0137708485",
      from: "1",
      to: "2",
    },
  });
  const watchFrom = watch("from", "1");
  const watchTo = watch("to");

  useEffect(() => {
    const setup = { bridgeSetupList };
    const chainbridge = new Sygma(setup);

    setSygmaInstance(chainbridge);
  }, []);


  useEffect(() => {
    if (sygmaInstance) {
      sygmaInstance.setDestination(watchTo);
    }
  }, [watchTo, sygmaInstance]);


  useEffect(() => {
    if (sygmaInstance && homeDepositNonce) {
      sygmaInstance.removeHomeChainDepositEventListener();
      sygmaInstance.createHomeChainDepositEventListener(
        depositEventLogs
      );

      sygmaInstance.removeDestinationProposalExecutionEventListener();
      sygmaInstance.destinationProposalExecutionEventListener(
        homeDepositNonce,
        proposalExecutionEventsLogs
      );
    }
  }, [sygmaInstance, homeDepositNonce]);

  const getAccountData = async (sygma: Sygma) => {
    try {
      const balance =
        (await sygma.getSignerBalance("chain1")) ?? BigNumber.from("0");
      const address = await sygma.getSignerAddress("chain1");
      const gasPrice = await sygma.getSignerGasPrice("chain1");
      // const balanceOfTokens = BigNumber.from("0")
      // const tokenName = ""
      const { balanceOfTokens, tokenName } = await sygma.getTokenInfo(
        "chain1"
      );
      console.log("signer balance", utils.formatEther(balance!));
      console.log("signer address", address);
      console.log("gas price", utils.formatEther(gasPrice!));
      // console.log("balance of tokens", utils.formatUnits(balanceOfTokens, 18));
      setValue("address", address!)
      setAccountData({
        balance: balance!,
        address: address!,
        gasPrice: gasPrice!,
        balanceOfTokens: balanceOfTokens!,
        tokenName: tokenName!,
      });
      // const tokenIds = listTokensOfOwner()
      console.log("🚀 ~ file: App.tsx ~ line 204 ~ getAccountData ~ address", address)
      const tokenList = await sygma.listErc721TokenIdsOfOwner(address!)
      setTokenList(tokenList)
      setIsReady(true);
    } catch (e) {
      console.log(e);
      console.log("Perhaps you forget to deploy the bridge?");
    }
  };

  useEffect(() => {
    if (window.ethereum !== undefined) {
      window.ethereum._metamask.isUnlocked().then((d: any) => {
        console.log("is metamask unlocked?", d);
        setMetaIsConnected(d);
      });
    }
  }, []);

  useEffect(() => {
    if (data !== undefined && sygmaInstance !== undefined) {
      getAccountData(sygmaInstance);
    }
  }, [data, logicConnected]);

  useEffect(() => {
    if (metaIsConnected && sygmaInstance !== undefined) {
      handleConnect();
      getAccountData(sygmaInstance! as Sygma);
    }
  }, [metaIsConnected]);

  const submit = async (values: any) => {
    const { amount, address, from, to } = values;

    const basicFeeData = await (sygmaInstance as Sygma).fetchBasicFeeData(
      {
        amount: amount,
        recipientAddress: address,
      }
    );
    if (!(basicFeeData instanceof Error)) {
      console.log(
        "🚀 ~ file: App.tsx ~ line 244 ~ submit ~ feeOracleData",
        basicFeeData
      );
      if (
        window.confirm(
          `Current fee: ${basicFeeData.calculatedRate} ${basicFeeData.erc20TokenAddress === constants.AddressZero ? 'ETH' : basicFeeData.erc20TokenAddress}\n\nTotal(amount+fee): ${
            parseFloat(amount) + parseFloat(basicFeeData.calculatedRate)
          } tokens\n\nDo you really want to proceed?`
        )
      ) {
        const approveTx = await (sygmaInstance as Sygma).approve({
          amountOrIdForApproval: amount,
        });
        console.log(
          "🚀 ~ file: App.tsx ~ line 259 ~ submit ~ approveTx",
          approveTx
        );
        const depositTx = await (sygmaInstance as Sygma).deposit({
          amount,
          recipientAddress: address,
          feeData: basicFeeData,
        });
        const depositEvent = await sygmaInstance!.getDepositEventFromReceipt(depositTx!)
        const { depositNonce } = depositEvent.args;
        setHomeDepositNonce(depositNonce.toNumber());
        console.log("result of transfer", depositTx);
      }
    }
  };

  const handleConnect = () => {
    // IF META IS NOT SIGNIN, TRIGGER POP OF THE WINDOW FOR THE EXTENSION
    if (!metaIsConnected) {
      return window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((r: any) => {
          console.log("request to unlock metamask", r);
          const [addr] = r;
          setMetaIsConnected(true);
          setAccountData({
            ...(accountData as LocalData),
            address: addr,
          });
        })
        .catch((error: any) => {
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log("Please connect to MetaMask.");
          } else {
            console.error(error);
          }
        });
    } else if (metaIsConnected) {

      const data = sygmaInstance?.initializeConnectionFromWeb3Provider(
        window.ethereum
      );

      //@ts-ignore-line
      setData(data);
      setLogicConnected(true);
    }
  };

  const inputStyles: CSSProperties = {
    display: "flex",
    alignSelf: "center",
    width: "50%",
    padding: "10px",
    border: "1px solid grey",
    textAlign: "start",
    fontSize: "15px",
    borderRadius: "5px",
    marginBottom: "5px",
    boxSizing: "border-box",
  };

  const labelStyles: CSSProperties = {
    display: "flex",
    alignSelf: "center",
    width: "50%",
    padding: "5px 10px",
    textAlign: "start",
    fontSize: "15px",
    borderRadius: "5px",
    marginBottom: "5px",
    boxSizing: "border-box",
  };

  const buttonStyle: CSSProperties = {
    display: "flex",
    alignSelf: "center",
    width: "20%",
    padding: "10px",
    marginTop: "15px",
    justifyContent: "center",
  };

  return (
    <div className="App">
      <h1 style={{ display: "flex", justifyContent: "center" }}>
        Minimal example
      </h1>
      <div>
        {accountData !== undefined && isReady && logicConnected && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3>Account data</h3>
            <p>
              Address: <span>{(accountData as LocalData).address}</span>
              <br />
              ETH:{" "}
              <span>
                {utils.formatEther((accountData as LocalData).balance)}
              </span>
              <br />
              Gas price:{" "}
              <span>
                {utils.formatEther((accountData as LocalData).gasPrice)}
              </span>
              <br />
              Balance of tokens:{" "}
              <span>
                <b>{accountData.balanceOfTokens.toString()}</b> of{" "}
                {accountData.tokenName} tokens
              </span>
            </p>
          </div>
        )}
      </div>
      {accountData !== undefined ? (
        <>
          <form
            action=""
            onSubmit={handleSubmit(submit)}
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <label htmlFor="amount" style={{ ...labelStyles }}>
              ERC721 Token IDs:
            </label>
            <select {...register("amount")} style={{ ...inputStyles }}>
              {tokenList && tokenList.map((tokenId) => (
                <option key={tokenId} value={tokenId}>
                  {tokenId}
                </option>
              ))}

            </select>

            <label htmlFor="address" style={{ ...labelStyles }}>
              Recepient address
            </label>
            <input
              type="text"
              placeholder="address"
              {...register("address")}
              style={{ ...inputStyles }}
            />
            <label htmlFor="from" style={{ ...labelStyles }}>
              Home chain
            </label>
            <select {...register("from")} style={{ ...inputStyles }}>
              {bridgeSetupList.map((bridgeItem) => (
                <option key={bridgeItem.domainId} value={bridgeItem.domainId}>
                  {bridgeItem.name}
                </option>
              ))}
            </select>
            <label htmlFor="to" style={{ ...labelStyles }}>
              Destination chain
            </label>
            <select {...register("to")} style={{ ...inputStyles }}>
              {bridgeSetupList
                .filter((el) => el.domainId !== watchFrom)
                .map((bridgeItem) => (
                  <option key={bridgeItem.domainId} value={bridgeItem.domainId}>
                    {bridgeItem.name}
                  </option>
                ))}
            </select>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-evenly",
              }}
            >
              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  background: "white",
                  color: "green",
                  border: "1px solid green",
                  fontWeight: "800",
                  borderRadius: "5px",
                }}
              >
                Bridge!
              </button>
            </div>
          </form>
        </>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleConnect}
            style={{
              ...buttonStyle,
              background: "dodgerblue",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Connect
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
