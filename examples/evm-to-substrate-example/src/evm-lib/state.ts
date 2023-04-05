export type StateType = {
  apiError: unknown;
  apiState: string | null;
  currentAccount: string | null;
  currentAccountData: string | null;
  selectedAsset: string | null;
  selectedAssetBalance: string | null;
  selectedAssetFee: string | null;
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
      return {
        ...state,
        // api: action.payload as string,
        apiState: "CONNECTING",
      };
    case "CONNECT_SUCCESS":
      return { ...state, apiState: "READY" };
    case "CONNECT_ERROR":
      return { ...state, apiState: "ERROR", apiError: action.payload };
    case "SET_CURRENT_ACCOUNT":
      return {
        ...state,
        currentAccount: action.payload as string,
      };
    case "SET_SELECTED_ASSET":
      return {
        ...state,
        selectedAsset: action.payload as string,
      };
    case "SET_CURRENT_ACCOUNT_DATA":
      return { ...state, currentAccountData: action.payload as string };
    case "SET_SELECTED_ASSET_BALANCE":
      return { ...state, selectedAssetBalance: action.payload as string };
    case "SET_ASSET_FEE":
      return { ...state, selectedAssetFee: action.payload as string };
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
