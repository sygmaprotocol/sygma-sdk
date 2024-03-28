import type { ethers } from 'ethers';
import type { Bridge } from '@buildwithsygma/sygma-contracts';
import type { FeeHandlerType } from '../../../types/index.js';

export type EvmFee = {
  fee: ethers.BigNumber;
  type: FeeHandlerType;
  handlerAddress: string;
  tokenAddress?: string;
  feeData?: string;
};

export type PercentageFee = EvmFee & {
  type: FeeHandlerType.PERCENTAGE;
  percentage: number;
  lowerBound: ethers.BigNumber;
  upperBound: ethers.BigNumber;
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

export type Erc20TransferParamsType = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** Identifier of the substrate destination parachain */
  parachainId?: number;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The amount of tokens to transfer */
  amount: string;
  /** The recipient's address to receive the tokens. */
  recipientAddress: string;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC20 token transfer, including the gas price and gas limit. */
  feeData: EvmFee;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};

export type Erc721TransferParamsType = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** Identifier of the substrate destination parachain */
  parachainId?: number;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The tokenId for a specific ERC721 token being transferred. */
  id: string;
  /** The recipient's address to receive the token. */
  recipientAddress: string;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC721 token transfer. */
  feeData: EvmFee;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};
