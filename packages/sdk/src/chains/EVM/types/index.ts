import { providers, ethers } from 'ethers';
import { Bridge, ERC20, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import { FeeHandlerType } from 'types';

export type EvmFee = {
  fee: ethers.BigNumber;
  feeData?: string;
  type: FeeHandlerType;
  tokenAddress?: string;
};

export type OracleResource = {
  baseEffectiveRate: string;
  tokenEffectiveRate: string;
  dstGasPrice: string;
  signature: string;
  fromDomainID: number;
  toDomainID: number;
  resourceID: string;
  dataTimestamp: number;
  signatureTimestamp: number;
  expirationTimestamp: number;
  msgGasLimit: string;
};

export type TokenConfig = {
  /** The token type (ERC20 or ERC721) */
  type: 'erc20' | 'erc721';
  /** The address of the token contract. */
  address: string;
  /** The optional name of the token. */
  name?: string;
  /** The optional symbol of the token. */
  symbol?: string;
  /** The optional URI of the token image. */
  imageUri?: string;
  /** The resource identifier of the token. */
  resourceId: string;
  /** An optional flag indicating if the token is a native wrapped token. */
  isNativeWrappedToken?: boolean;
  /** The optional number of decimals for the token. */
  decimals?: number;
  /** An optional flag indicating if the token requires double approval (like USDT). */
  isDoubleApproval?: boolean;
  /** The fee settings for the token. */
  feeSettings: {
    /** The type of fee, either 'basic', 'dynamic'. */
    type: FeeHandlerType;
    /** The address of fee handler contract. */
    address: string;
  };
};

/**
 *  The config of the bridge
 */
export type BridgeConfigParam = {
  /** The address of the bridge contract. */
  bridgeAddress: string;
  /** The address of the ERC20 handler contract. */
  erc20HandlerAddress: string;
  /** The address of the ERC721 handler contract. */
  erc721HandlerAddress: string;
  /** The domainId is an identifier of bridge in Sygma ecosystem. */
  domainId: string;
  /** An array of token configurations. */
  tokens: Array<TokenConfig>;
  /** The optional number of confirmations */
  confirmations?: number;
};
/**
 *  The information needed for processing the token transfer deposit.
 */
export type TokenDeposit = {
  /** The amount of tokens to transfer or tokenId for ERC721 token, depending on the use case. */
  amountOrId: string;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The recipient's address to receive the tokens. */
  recipientAddress: string;
  /** The fee data associated with the token transfer.  */
  feeData: EvmFee;
};

export type TokenTransfer = {
  /** The information needed for processing the token transfer deposit. */
  depositParams: TokenDeposit;
  /** The bridge configuration parameters for processing the token transfer. */
  bridgeConfig: BridgeConfigParam;
  /** The provider used to interact with the blockchain network. */
  provider: providers.Provider;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};

export type Erc20TransferParamsType = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The amount of tokens to transfer */
  amountOrId: string;
  /** The recipient's address to receive the tokens. */
  recipientAddress: string;
  /** The handler address responsible for processing the ERC20 token transfer. */
  handlerAddress: string;
  /** The ERC20 token instance used for the transfer. */
  tokenInstance: ERC20;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC20 token transfer, including the gas price and gas limit. */
  feeData: EvmFee;
  /** The provider used to interact with the blockchain network. */
  provider: providers.Provider;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};

export type Erc721TransferParamsType = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The tokenId for a specific ERC721 token being transferred. */
  amountOrId: string;
  /** The recipient's address to receive the token. */
  recipientAddress: string;
  /** The handler address responsible for processing the ERC721 token transfer. */
  handlerAddress: string;
  /** The ERC721 token instance used for the transfer. */
  tokenInstance: ERC721MinterBurnerPauser;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC721 token transfer. */
  feeData: EvmFee;
  /** The provider used to interact with the blockchain network. */
  provider: providers.Provider;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};
