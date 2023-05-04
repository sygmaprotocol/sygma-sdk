import { providers, BigNumber } from "ethers";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { ApiPromise } from "@polkadot/api";
import { DefinitionRpcExt } from "@polkadot/types/types";
import {
  EvmBridgeSetup,
  FeeDataResult,
} from "@buildwithsygma/sygma-sdk-core/deprecated";
import { TokenConfig } from "@buildwithsygma/sygma-sdk-core/EVM";
import { ERC20 } from "@buildwithsygma/sygma-contracts";

import { LocalConfig, GoerliRococoConfig } from "../config";

export type StateType = {
  enviroment: string | null;
  socket: string | null;
  jsonrpc: {
    [x: string]: Record<string, DefinitionRpcExt>;
  };
  api: ApiPromise | null;
  apiError: unknown;
  apiState: string | null;
  selectedEvmConfig: EvmBridgeSetup | null;
  currentAccount: string | null;
  signer: providers.JsonRpcSigner | null;
  ethBalance: BigNumber | null;
  selectedErc20TokenConfig: TokenConfig | null;
  selectedErc20Instance: ERC20 | null;
  selectedErc20Balance: BigNumber | null;
  basicFee: FeeDataResult | null;
  erc20AllowanceForBridge: BigNumber | null;
  destinationDomainId: number | null;
  homeChainId: number;
  transferStatus: string | null;
  transferStatusBlock: string | null;
  depositNonce: number | null;
  substrateStatus: string | null;
  proposalExecution: string | null;
};
type ActionType = { type: string; payload?: unknown };

/**
 * Initial state for `useReducer`
 */
export const initialState: StateType = {
  // These are the states
  enviroment: null,
  socket: null,
  jsonrpc: { ...jsonrpc },
  api: null,
  apiError: null,
  apiState: null,
  selectedEvmConfig: null,
  currentAccount: null,
  signer: null,
  ethBalance: null,
  selectedErc20TokenConfig: null,
  selectedErc20Instance: null,
  selectedErc20Balance: null,
  basicFee: null,
  erc20AllowanceForBridge: null,
  destinationDomainId: null,
  homeChainId: 1,
  transferStatus: "Init",
  transferStatusBlock: null,
  depositNonce: null,
  substrateStatus: "Init",
  proposalExecution: null,
};

/**
 *
 * Reducer function for `useReducer`
 */
export const reducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "SET_ENVIROMENT":
      switch (action.payload) {
        case "development":
          return {
            ...state,
            enviroment: action.payload as string,
            socket: GoerliRococoConfig.substrateConfig.provider_socket,
            destinationDomainId: Number(
              GoerliRococoConfig.substrateConfig.domainId
            ),
          };
        case "local":
          return {
            ...state,
            enviroment: action.payload as string,
            socket: LocalConfig.substrateConfig.provider_socket,
            destinationDomainId: Number(LocalConfig.substrateConfig.domainId),
          };
        default:
          return state;
      }
    case "CONNECT_INIT":
      return { ...state, apiState: "CONNECT_INIT" };
    case "CONNECT":
      return {
        ...state,
        api: action.payload as ApiPromise,
        apiState: "CONNECTING",
      };
    case "CONNECT_SUCCESS":
      return { ...state, apiState: "READY" };
    case "CONNECT_ERROR":
      return { ...state, apiState: "ERROR", apiError: action.payload };
    case "SET_EVM_CONFIG": {
      const selectedEvmConfig = action.payload as EvmBridgeSetup;
      return {
        ...state,
        homeChainId: Number(selectedEvmConfig.domainId),
        selectedEvmConfig,
      };
    }
    case "SET_CURRENT_ACCOUNT":
      return {
        ...state,
        currentAccount: action.payload as string,
      };
    case "SET_SIGNER":
      return {
        ...state,
        signer: action.payload as providers.JsonRpcSigner,
      };
    case "SET_SELECTED_ERC20_TOKEN_CONFIG":
      return {
        ...state,
        selectedErc20TokenConfig: action.payload as TokenConfig,
      };
    case "SET_ETH_BALANCE":
      return { ...state, ethBalance: action.payload as BigNumber };
    case "SET_SELECTED_ERC20_BALANCE":
      return { ...state, selectedErc20Balance: action.payload as BigNumber };
    case "SET_SELECTED_ERC20_INSTANCE":
      return { ...state, selectedErc20Instance: action.payload as ERC20 };
    case "SET_ERC20_ALLOWANCE_FOR_BRIDGE":
      return { ...state, erc20AllowanceForBridge: action.payload as BigNumber };
    case "SET_BASIC_FEE":
      return { ...state, basicFee: action.payload as FeeDataResult };
    case "SET_TRANSFER_STATUS":
      return { ...state, transferStatus: action.payload as string };
    case "SET_TRANSFER_STATUS_BLOCK":
      return { ...state, transferStatusBlock: action.payload as string };
    case "SET_DEPOSIT_NONCE":
      return { ...state, depositNonce: action.payload as number };
    case "SET_SUBSTRATE_STATUS":
      return { ...state, substrateStatus: action.payload as string };
    case "SET_PROPOSAL_EXECUTION_BLOCK":
      return {
        ...state,
        substrateStatus: "ProposalExecution event has found. Tranfer finished",
        proposalExecution: action.payload as string,
      };
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};
