import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { DefinitionRpcExt } from '@polkadot/types/types';
import type { SubstrateConfigAssetType } from "@buildwithsygma/sygma-sdk-core";
import type {AssetBalance, AccountData} from "@polkadot/types/interfaces";
import type { Option, u128, } from '@polkadot/types';
import { substrateConfig, evmSetupList } from "../config";
import { ApiPromise } from '@polkadot/api';
import { Keyring} from '@polkadot/ui-keyring';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';


const connectedSocket = substrateConfig.provider_socket;

export type StateType = {
  socket: string;
  jsonrpc: {
    [x: string]: Record<string, DefinitionRpcExt>;
};
  keyring: Keyring | null;
  keyringState: string | null;
  api: ApiPromise | null;
  apiError: unknown;
  apiState: string | null;
  currentAccount: InjectedAccountWithMeta | null;
  currentAccountData: AccountData | null;
  selectedAsset: SubstrateConfigAssetType | null;
  selectedAssetBalance: AssetBalance | null;
  selectedAssetFee: Option<u128> | null;
  destinationDomainId: number;
  homeChainId: number;
  transferStatus: string | null;
  transferStatusBlock: string | null;
  depositNonce: number | null;
  evmStatus: string | null,
  proposalExecution: string | null;
};
type ActionType = { type: string; payload?: unknown };

/**
 * Initial state for `useReducer`
 */
export const initialState: StateType = {
  // These are the states
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc },
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null,
  currentAccount: null,
  currentAccountData: null,
  selectedAsset: null,
  selectedAssetBalance: null,
  selectedAssetFee: null,
  destinationDomainId: 2,
  homeChainId: 3,
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
      return { ...state, api: action.payload as ApiPromise, apiState: "CONNECTING" };
    case "CONNECT_SUCCESS":
      return { ...state, apiState: "READY" };
    case "CONNECT_ERROR":
      return { ...state, apiState: "ERROR", apiError: action.payload };
    case "LOAD_KEYRING":
      return { ...state, keyringState: "LOADING" };
    case "SET_KEYRING":
      return { ...state, keyring: action.payload as Keyring, keyringState: "READY" };
    case "KEYRING_ERROR":
      return { ...state, keyring: null, keyringState: "ERROR" };
    case "SET_CURRENT_ACCOUNT":
      return { ...state, currentAccount: action.payload as InjectedAccountWithMeta };
    case "SET_SELECTED_ASSET":
      return { ...state, selectedAsset: action.payload as SubstrateConfigAssetType  };
    case "SET_CURRENT_ACCOUNT_DATA":
      return { ...state, currentAccountData: action.payload as AccountData };
    case "SET_SELECTED_ASSET_BALANCE":
      return { ...state, selectedAssetBalance: action.payload as AssetBalance };
    case "SET_ASSET_FEE":
      return { ...state, selectedAssetFee: action.payload as Option<u128>  };
    case "SET_TRANSFER_STATUS":
      return { ...state, transferStatus: action.payload as string};
    case "SET_TRANSFER_STATUS_BLOCK":
      return { ...state, transferStatusBlock: action.payload as string };
    case "SET_DEPOSIT_NONCE":
      return { ...state, depositNonce: action.payload as number};
    case "SET_EVM_STATUS":
      return { ...state, evmStatus: action.payload as string}
    case "SET_PROPOSAL_EXECUTION_BLOCK":
      return { ...state, evmStatus: "ProposalExecution event has found. Tranfer finished", proposalExecution: action.payload as string };
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};