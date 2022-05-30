import React, {
  CSSProperties,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { BigNumber, utils } from "ethers";
import { BridgeEvents } from "@chainsafe/chainbridge-sdk-core/dist/src/types/types";
import { useForm } from "react-hook-form";
import { Chainbridge } from "@chainsafe/chainbridge-sdk-core";

// TODO: MOVE THIS TO ENV
const bridgeSetup = {
  chain1: {
    bridgeAddress: "0x22DB0E23228B07523B931045f93f0df93D099F1D",
    erc20Address: "0x141F8690A87A7E57C2E270ee77Be94935970c035",
    erc20HandlerAddress: "0x4FDc0179312d299724BA4F3247d76f77F37Dad5B",
    rpcURL: "http://localhost:8545",
    domainId: "1",
    erc20ResourceID:
      "0x0000000000000000000000141f8690a87a7e57c2e270ee77be94935970c03501",
    decimals: 18,
  },
  chain2: {
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0x75dF75bcdCa8eA2360c562b4aaDBAF3dfAf5b19b",
    erc20HandlerAddress: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
    rpcURL: "http://localhost:8547",
    domainId: "2",
    erc20ResourceID:
      "0x0000000000000000000000141f8690a87a7e57c2e270ee77be94935970c03501",
    decimals: 18,
  },
};

const feeOracleSetup = {
  feeOracleBaseUrl: 'http://localhost:8091',
  feeOracleHandlerAddress: '0xa9ddD97e1762920679f3C20ec779D79a81903c0B'
}

const notEve = "0xF4314cb9046bECe6AA54bb9533155434d0c76909";

type LocalData = {
  balance: BigNumber;
  address: string;
  gasPrice: BigNumber;
  balanceOfTokens: BigNumber;
  tokenName: string;
};

type ChainbridgeData = { chain1: BridgeEvents; chain2: BridgeEvents };

function App() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "1.0",
      address: "0x74d2946319bEEe4A140068eb83F9ee3a90B06F4f",
      from: "chain1",
      to: 'chain2'
    }
  });
  const [data, setData] = useState<SetStateAction<ChainbridgeData | undefined>>(
    undefined
  );

  const [chainbridgeInstance, setChainbridgeInstance] = useState<
    SetStateAction<Chainbridge | undefined>
  >(undefined);

  const [accountData, setAccountData] = useState<
    SetStateAction<LocalData | undefined>
  >(undefined);

  const [metaIsConnected, setMetaIsConnected] = useState<
    SetStateAction<boolean>
  >(false);

  const [isReady, setIsReady] = useState<SetStateAction<boolean>>(false);

  const [logicConnected, setLogicConnected] = useState<SetStateAction<boolean>>(
    false
  );

  const getAccountData = async (chainbridge: Chainbridge) => {
    try {
      const balance =
        (await chainbridge.getSignerBalance("chain1")) ?? BigNumber.from("0");
      const address = await chainbridge.getSignerAddress("chain1");
      const gasPrice = await chainbridge.getSignerGasPrice("chain1");
      const { balanceOfTokens, tokenName } = await chainbridge.getTokenInfo(
        "chain1"
      );
      console.log("signer balance", utils.formatEther(balance!));
      console.log("signer address", address);
      console.log("gas price", utils.formatEther(gasPrice!));
      console.log("balance of tokens", utils.formatUnits(balanceOfTokens, 18));
      setAccountData({
        balance: balance!,
        address: address!,
        gasPrice: gasPrice!,
        balanceOfTokens: balanceOfTokens!,
        tokenName: tokenName!,
      });
      setIsReady(true);
    } catch (e) {
      console.log(e);
      console.log("Perhaps you forget to deploy the bridge?")
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
    if (data !== undefined && chainbridgeInstance !== undefined) {
      getAccountData(chainbridgeInstance! as Chainbridge);
    }
  }, [data, logicConnected]);

  useEffect(() => {
    console.log(metaIsConnected, data);
    if (metaIsConnected && chainbridgeInstance !== undefined) {
      handleConnect();
      getAccountData(chainbridgeInstance! as Chainbridge);
    }
  }, [metaIsConnected]);

  const depositEventLogs = (
    destinationChainId: any,
    resoureId: any,
    depositNonce: any,
    user: any,
    data: any,
    handleResponse: any,
    tx: any
  ) => {
    console.log(
      `bride deposit event deposit nonce: ${depositNonce.toString()} to contract with ResourceId: ${resoureId}`
    );
    console.log(` transaction hash: ${tx.transactionHash}`);
    console.info("Deposit in transit!");
  };

  const proposalEventsLogs = async (
    originDomainId: any,
    despositNonce: any,
    status: any,
    dataHash: any,
    tx: any
  ) => {
    console.warn("proposal events!")
    const proposalStatus = BigNumber.from(status).toNumber();

    switch (proposalStatus) {
      // @ts-expect-error
      case 1: {
        console.log("");
        console.log("Proposal created!!!!");
        console.log("");
      }
      // @ts-expect-error
      case 2: {
        console.log("");
        console.log("Proposal has passed, Executing!");
        console.log("");
      }
      case 3: {
        console.log("");
        console.log("Transfer completed!!!");
        console.log("");
        return;
      }
      case 4: {
        console.log("");
        console.log("Transfer aborted!");
        console.log("");
        return;
      }
      default:
        return;
    }
  };

const funcVoteEvent = async (
  originDomainId: any,
  depositNonce: any,
  status: any,
  dataHash: any,
  tx: any
) => {
  const txReceipt = await tx.getTransactionReceipt();

  console.log("txReceipt", txReceipt.status === 1 ? "Confirmed" : "Rejected");
  console.log("status", status);
  return
};
  const submit = async (values: any) => {
    // console.log("submit data", values);
    const { amount, address, from, to } = values;

    const events = (data as ChainbridgeData)[from as keyof ChainbridgeData];

    // console.log("events object", events)

    // THIS IS HORRENDOUS
    // @ts-ignore-line
    events?.bridgeEvents(depositEventLogs)
    // // @ts-ignore-line
    const proposalEvents = events?.proposalEvents![to as keyof ChainbridgeData]
    // console.log("proposal events", proposalEvents)
    proposalEvents!(await proposalEventsLogs)
    const voteEvents = events?.voteEvents![to as keyof ChainbridgeData]
    voteEvents!(await funcVoteEvent);

    // // console.log(events?.proposalEvents)

    // const result = await (chainbridgeInstance as Chainbridge).deposit(
    //   Number(amount),
    //   address,
    //   from,
    //   to
    // );

    // console.log("result of deposit:", result)
    const feeOracleData = await(
      chainbridgeInstance as Chainbridge
    ).fetchFeeData({
      amount: Number(amount),
      recipientAddress: address,
      from,
      to,
    });
    if (feeOracleData) {
      if (window.confirm(`Current fee for the token ${feeOracleData.erc20TokenAddress} is\n\n${feeOracleData.calculatedRate} tokens.\n\nTotal(amount+fee): ${parseFloat(amount) + parseFloat(feeOracleData.calculatedRate)} tokens\n\nDo you really want to proceed?`)) {
        // window.open("exit.html", "Thanks for Visiting!");
            const result = await (chainbridgeInstance as Chainbridge).deposit(
            Number(amount),
            address,
            from,
            to,
            feeOracleData.feeData
          );
          console.log("result of transfer", result);
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
      const setup = { bridgeSetup, feeOracleSetup };
      const chainbridge = new Chainbridge(setup);

      setChainbridgeInstance(chainbridge);

      const data = chainbridge.initializeConnection();

      console.log("data", data);

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
                <b>{utils.formatUnits(
                  (accountData as LocalData).balanceOfTokens,
                  18
                )}</b>
                {" "}
                of{" "}
                {(accountData as LocalData).tokenName} tokens
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
            <input
              type="text"
              placeholder="amount"
              {...register("amount")}
              style={{ ...inputStyles }}
            />
            <input
              type="text"
              placeholder="address"
              {...register("address")}
              style={{ ...inputStyles }}
            />
            <input
              type="text"
              placeholder="from"
              {...register("from")}
              style={{ ...inputStyles }}
            />
            <input
              type="text"
              placeholder="to"
              {...register("to")}
              style={{ ...inputStyles }}
            />
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
              <button
                style={{
                  ...buttonStyle,
                  background: "white",
                  color: "red",
                  border: "1px solid red",
                  fontWeight: "800",
                  borderRadius: "5px",
                }}
              >
                Disconnect
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
