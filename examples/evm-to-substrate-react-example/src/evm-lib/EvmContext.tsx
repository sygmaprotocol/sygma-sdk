import React, { useEffect, useReducer, useContext, createContext } from "react";
import { BigNumber, ethers, providers, utils } from "ethers";
import {
  ERC20__factory,
  Bridge__factory,
} from "@buildwithsygma/sygma-contracts";
import { decodeAddress } from "@polkadot/util-crypto";
import {
  calculateBasicfee,
  erc20Transfer,
  approve,
  getDepositEventFromReceipt,
  isEIP1559MaxFeePerGas,
} from "@buildwithsygma/sygma-sdk-core/EVM";
import {
  listenForEvent,
  substrateSocketConnect,
} from "@buildwithsygma/sygma-sdk-core/Substrate";

import { evmSetupList } from "../config";
import { reducer, initialState, StateType } from "./state";

export type EvmContextType = {
  state: StateType;
  makeDeposit: (
    amount: string,
    address: string,
    destinationDomainId: string
  ) => Promise<void>;
};

const EvmContext = createContext<EvmContextType>({
  state: initialState,
  makeDeposit: async () => {},
});

const EvmContextProvider = (props: {
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("connect", () => {
        window.location.reload();
      });
    }
    if (window.ethereum && !state.currentAccount) {
      void (async () => {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as unknown as providers.ExternalProvider
        );
        await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();

        if (![1337, 1338].includes(network.chainId)) {
          // throw new Error("Please connect to the right network");
          // @ts-ignore-line
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x539",
                rpcUrls: ["http://localhost:8545"],
              },
            ],
          });
        }

        const evmConfig = evmSetupList.find(
          (evmSetup) => evmSetup.networkId === network.chainId
        );
        if (!evmConfig) {
          throw new Error("No EVM config found for network");
        }
        dispatch({ type: "SET_EVM_CONFIG", payload: evmConfig });

        const selectedErc20TokenConfig = evmConfig.tokens[0];
        dispatch({
          type: "SET_SELECTED_ERC20_TOKEN_CONFIG",
          payload: selectedErc20TokenConfig,
        });

        const signer = provider.getSigner();
        dispatch({ type: "SET_SIGNER", payload: signer });

        const currentAccountAddress = await signer.getAddress();
        dispatch({
          type: "SET_CURRENT_ACCOUNT",
          payload: currentAccountAddress,
        });

        const ethBalance = await provider.getBalance(currentAccountAddress);
        dispatch({ type: "SET_ETH_BALANCE", payload: ethBalance });

        const erc20TokenInstance = ERC20__factory.connect(
          selectedErc20TokenConfig.address,
          signer
        );
        dispatch({
          type: "SET_SELECTED_ERC20_INSTANCE",
          payload: erc20TokenInstance,
        });

        const erc20TokenBalance = await erc20TokenInstance.balanceOf(
          currentAccountAddress
        );
        dispatch({
          type: "SET_SELECTED_ERC20_BALANCE",
          payload: erc20TokenBalance,
        });

        const erc20AllowanceForBridge = await erc20TokenInstance.allowance(
          currentAccountAddress,
          evmConfig.erc20HandlerAddress
        );
        dispatch({
          type: "SET_ERC20_ALLOWANCE_FOR_BRIDGE",
          payload: erc20AllowanceForBridge,
        });
      })();
    }
  }, [state.currentAccount, dispatch]);

  useEffect(() => {
    const {
      signer,
      currentAccount,
      selectedErc20TokenConfig,
      selectedEvmConfig,
      destinationDomainId
    } = state;
    if (
      signer &&
      currentAccount &&
      selectedErc20TokenConfig &&
      selectedEvmConfig &&
      destinationDomainId
    ) {
      void (async () => {
        const basicFee = await calculateBasicfee({
          basicFeeHandlerAddress: selectedErc20TokenConfig.feeSettings.address,
          provider: signer.provider as providers.Web3Provider,
          sender: currentAccount,
          fromDomainID: selectedEvmConfig.domainId,
          // TODO: extract to constant
          toDomainID: destinationDomainId.toString(), // substrate destination netwrok domainID
          resourceID: selectedErc20TokenConfig.resourceId,
          tokenAmount: "1",
          recipientAddress: ethers.constants.AddressZero,
        });
        dispatch({ type: "SET_BASIC_FEE", payload: basicFee });
      })();
    }
  }, [
    state.currentAccount,
    state.selectedErc20TokenConfig,
    state.signer,
    state.selectedEvmConfig,
    state.destinationDomainId,
    dispatch,
  ]);

  useEffect(() => {
    if (state.api && state.depositNonce) {
      void (async () => {
        dispatch({
          type: "SET_SUBSTRATE_STATUS",
          payload: "Start listening for ProposalExecution event",
        });
        await listenForEvent(state.api!, "ProposalExecution", (data) => {
          console.log("ProposalExecution", data);
          const dataEvent = data as {
            depositNonce: string;
            dataHash: string;
          };
          dispatch({
            type: "SET_SUBSTRATE_STATUS",
            payload: "ProposalExecution event is emmited. Transfer is finished",
          });
          dispatch({
            type: "SET_PROPOSAL_EXECUTION_BLOCK",
            payload: dataEvent.dataHash,
          });
        });
      })();
    }
  }, [state.api, state.depositNonce]);

  substrateSocketConnect(state, {
    onConnectInit: () => dispatch({ type: "CONNECT_INIT", payload: undefined }),
    onConnect: (_api) => dispatch({ type: "CONNECT", payload: _api }),
    onConnectSucccess: () =>
      dispatch({ type: "CONNECT_SUCCESS", payload: undefined }),
    onConnectError: (err) => dispatch({ type: "CONNECT_ERROR", payload: err }),
  });

  async function makeDeposit(
    amount: string,
    address: string,
    destinationDomainId: string
  ): Promise<void> {
    console.log("makeDeposit", amount, address, destinationDomainId);
    const {
      erc20AllowanceForBridge,
      selectedErc20Instance,
      selectedErc20TokenConfig,
      selectedEvmConfig,
      basicFee,
      signer,
    } = state;

    const amountInWei = utils.parseUnits(amount, 18);
    try {
      if (erc20AllowanceForBridge!.lt(amountInWei)) {
        const allowedAmountForBridge =
          erc20AllowanceForBridge!.sub(amountInWei);
        await approveForBridge(allowedAmountForBridge.abs());
      }

      const bridgeInstance = Bridge__factory.connect(
        selectedEvmConfig!.bridgeAddress,
        signer!
      );
      const addressPublicKeyInBytes = decodeAddress(address);
      const addressPublicKeyHexString = ethers.utils.hexlify(
        addressPublicKeyInBytes
      );
      const destinationMultiLocation = JSON.stringify({
        parents: 0,
        interior: {
          X1: {
            AccountId32: {
              network: { any: null },
              id: addressPublicKeyHexString,
            },
          },
        },
      });
      const depositTransaction = await erc20Transfer({
        amountOrId: amount,
        recipientAddress: destinationMultiLocation,
        tokenInstance: selectedErc20Instance!,
        bridgeInstance,
        handlerAddress: selectedEvmConfig!.erc20HandlerAddress,
        domainId: destinationDomainId,
        resourceId: selectedErc20TokenConfig!.resourceId,
        feeData: basicFee,
        provider: signer!.provider as providers.Web3Provider,
      });
      dispatch({
        type: "SET_TRANSFER_STATUS",
        payload: "Deposit transaction sent",
      });
      dispatch({
        type: "SET_TRANSFER_STATUS_BLOCK",
        payload: depositTransaction.hash,
      });
      const depositTransactionReceipt = await depositTransaction.wait(1);

      const depositEvent = await getDepositEventFromReceipt(
        depositTransactionReceipt,
        bridgeInstance
      );
      dispatch({
        type: "SET_TRANSFER_STATUS",
        payload: "DepositEvent is received",
      });
      console.log("depositNonce", depositEvent.args.depositNonce);
      dispatch({
        type: "SET_DEPOSIT_NONCE",
        payload: depositEvent.args.depositNonce,
      });
    } catch (e) {
      console.log("error in makeDeposit", e);
      return Promise.reject(e);
    }
  }

  async function approveForBridge(amount: BigNumber): Promise<void> {
    const { selectedErc20Instance, selectedEvmConfig, signer } = state;
    const gasPrice = await isEIP1559MaxFeePerGas(
      signer!.provider as providers.Web3Provider
    );

    await approve(
      amount,
      selectedErc20Instance!,
      selectedEvmConfig!.erc20HandlerAddress,
      1,
      {
        gasPrice,
      }
    );
  }

  return (
    <EvmContext.Provider value={{ state, makeDeposit }}>
      {props.children}
    </EvmContext.Provider>
  );
};

const useEvm = (): EvmContextType => useContext(EvmContext);

export { EvmContextProvider, useEvm };
