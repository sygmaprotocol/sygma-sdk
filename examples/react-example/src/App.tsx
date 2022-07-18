import React, {
  CSSProperties,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { BigNumber, utils } from "ethers";
import { BridgeEvents } from "@chainsafe/chainbridge-sdk-core/dist/src/types/types";
import { useForm } from "react-hook-form";
import { Sygma, BridgeData, SygmaBridgeSetupList } from "@chainsafe/chainbridge-sdk-core";

// TODO: MOVE THIS TO ENV
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

const bridgeSetupList: SygmaBridgeSetupList = [
  {
    domainId: "1",
    name: 'Local EVM 1',
    networkId: '422',
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
    erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
    rpcURL: "http://localhost:8545",
    erc20ResourceID:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    decimals: 18,
    feeSettings: {
      type: 'basic',
      address: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69'
    }
  },
  {
    domainId: "2",
    name: 'Local EVM 2',
    networkId: '422',
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
    erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
    rpcURL: "http://localhost:8547",
    erc20ResourceID:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    decimals: 18,
    feeSettings: {
      type: 'basic',
      address: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69'
    }
  },
  {
    domainId: "3",
    name: 'Local EVM 3 (same as 1)',
    networkId: '422',
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
    erc20HandlerAddress: "0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e",
    rpcURL: "http://localhost:8545",
    erc20ResourceID:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    decimals: 18,
    feeSettings: {
      type: 'basic',
      address: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69'
    }
  },
];

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

type SygmaData = { chain1: BridgeEvents; chain2: BridgeEvents };

const proposalExecutionEventsLogs = async (
  originDomainId: any,
  despositNonce: any,
  dataHash: any,
  tx: any
) => {
  console.warn("Proposal execution event!")
  console.log({originDomainId, despositNonce, dataHash, tx} )
  console.warn("Transfer complete!")
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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "1",
      address: "0x4CEEf6139f00F9F4535Ad19640Ff7A0137708485",
      from: "1",
      to: '2'
    }
  });
  const watchFrom = watch("from", "1");
  const watchTo = watch("to");


  const [data, setData] = useState<SetStateAction<SygmaData | undefined>>(
    undefined
  );

  const [chainbridgeInstance, setSygmaInstance] = useState<
    SetStateAction<Sygma | undefined>
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
  const [bridge, setBridge] = useState<SetStateAction<any | undefined>>(undefined)
  useEffect(() => {
    const setup = { bridgeSetupList, bridgeSetup };
    const chainbridge = new Sygma(setup);

    setSygmaInstance(chainbridge);
  }, [])
  useEffect(() => {
    console.log('watchTo', watchTo)
    if (chainbridgeInstance) {
      (chainbridgeInstance as Sygma).setDestination(watchTo)
    }
  }, [watchTo, chainbridgeInstance])
  useEffect(() => {
    if (bridge) {
      (chainbridgeInstance as Sygma).removeHomeChainDepositEventListener();
      (chainbridgeInstance as Sygma).createHomeChainDepositEventListener(depositEventLogs);

      (chainbridgeInstance as Sygma).removeDestinationProposalExecutionEventListener();
      (chainbridgeInstance as Sygma).destinationProposalExecutionEventListener(proposalExecutionEventsLogs);
    }
  }, [bridge])

  useEffect(() => {

  }, [])

  const getAccountData = async (chainbridge: Sygma) => {
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
      getAccountData(chainbridgeInstance! as Sygma);
      setBridge((chainbridgeInstance! as Sygma).bridges!['chain2'])
    }
  }, [data, logicConnected]);

  useEffect(() => {
    console.log(metaIsConnected, data);
    if (metaIsConnected && chainbridgeInstance !== undefined) {
      handleConnect();
      getAccountData(chainbridgeInstance! as Sygma);
    }
  }, [metaIsConnected]);

  const submit = async (values: any) => {
    const { amount, address, from, to } = values;

    const basicFeeData = await (chainbridgeInstance as Sygma).fetchBasicFeeData(
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
          `Current fee for the token ${basicFeeData.erc20TokenAddress} is\n\n${
            basicFeeData.calculatedRate
          } tokens.\n\nTotal(amount+fee): ${
            parseFloat(amount) + parseFloat(basicFeeData.calculatedRate)
          } tokens\n\nDo you really want to proceed?`
        )
      ) {
        const approveTx = await (chainbridgeInstance as Sygma).approve({
          amounForApproval: "1",
        });
        console.log(
          "🚀 ~ file: App.tsx ~ line 259 ~ submit ~ approveTx",
          approveTx
        );
        const result = await (chainbridgeInstance as Sygma).deposit({
          amount,
          recipientAddress: address,
          feeData: basicFeeData.feeData,
        });
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
      // const setup = { bridgeSetup };

      const data = (chainbridgeInstance as Sygma).initializeConnectionFromWeb3Provider(window.ethereum);

      console.log("data", data);
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
    boxSizing: "border-box"
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
                <b>
                  {utils.formatUnits(
                    (accountData as LocalData).balanceOfTokens,
                    18
                  )}
                </b>{" "}
                of {(accountData as LocalData).tokenName} tokens
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
            <select {...register("from")} style={{ ...inputStyles }}>
              {bridgeSetupList.map((bridgeItem) => (
                <option key={bridgeItem.domainId} value={bridgeItem.domainId}>
                  {bridgeItem.name}
                </option>
              ))}
            </select>
            <select
              {...register("to")}
              style={{ ...inputStyles }}
            >
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
