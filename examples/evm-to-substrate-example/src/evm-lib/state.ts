import { providers, BigNumber } from "ethers";
import {
  EvmBridgeSetup,
  TokenConfig,
  FeeDataResult,
} from "@buildwithsygma/sygma-sdk-core";
import { ERC20 } from "@buildwithsygma/sygma-contracts";

export type StateType = {
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
  erc20AllowanceForFeeHandler: BigNumber | null;
  destinationDomainId: number;
  homeChainId: number;
  transferStatus: string | null;
  transferStatusBlock: string | null;
  depositNonce: number | null;
  evmStatus: string | null;
  proposalExecution: string | null;
};
type ActionType = { type: string; payload?: unknown };

/**
 * Initial state for `useReducer`
 */
export const initialState: StateType = {
  // These are the states
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
  erc20AllowanceForFeeHandler: null,
  destinationDomainId: 3,
  homeChainId: 1,
  transferStatus: "Init",
  transferStatusBlock: null,
  depositNonce: null,
  evmStatus: "Init",
  proposalExecution: null,
};

/**
 *
 * Reducer function for `useReducer`
 */
export const reducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "CONNECT_INIT":
      return { ...state, apiState: "CONNECT_INIT" };
    case "CONNECT":
      return {
        ...state,
        // api: action.payload as string,
        apiState: "CONNECTING",
      };
    case "CONNECT_SUCCESS":
      return { ...state, apiState: "READY" };
    case "CONNECT_ERROR":
      return { ...state, apiState: "ERROR", apiError: action.payload };
    case "SET_EVM_CONFIG":
      return {
        ...state,
        selectedEvmConfig: action.payload as EvmBridgeSetup,
      };
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
    case "SET_ERC20_ALLOWANCE_FOR_FEE_HANDLER":
      return {
        ...state,
        erc20AllowanceForFeeHandler: action.payload as BigNumber,
      };
    case "SET_BASIC_FEE":
      return { ...state, basicFee: action.payload as FeeDataResult };
    case "SET_TRANSFER_STATUS":
      return { ...state, transferStatus: action.payload as string };
    case "SET_TRANSFER_STATUS_BLOCK":
      return { ...state, transferStatusBlock: action.payload as string };
    case "SET_DEPOSIT_NONCE":
      return { ...state, depositNonce: action.payload as number };
    case "SET_EVM_STATUS":
      return { ...state, evmStatus: action.payload as string };
    case "SET_PROPOSAL_EXECUTION_BLOCK":
      return {
        ...state,
        evmStatus: "ProposalExecution event has found. Tranfer finished",
        proposalExecution: action.payload as string,
      };
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};
