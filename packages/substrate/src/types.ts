import type { Domain, FeeHandlerType, SubstrateResource } from '@buildwithsygma/core';
import type { ExtrinsicStatus } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

export type ParachainId = number;

export type SubstrateFee = {
  fee: BN;
  type: FeeHandlerType;
};

type AssetTransfer = {
  recipient: string;
  parachainId?: ParachainId;
};

export type Fungible = AssetTransfer & {
  amount: string;
};
export type Transfer<TransferType> = {
  details: TransferType;
  to: Domain;
  from: Domain;
  resource: SubstrateResource;
  sender: string;
};

export type DepositEventDataType = {
  depositData: string;
  depositNonce: string;
  destDomainId: string;
  handlerResponse: string;
  resourceId: string;
  sender: string;
  transferType: string;
};

export type DepositCallbacksType = {
  /**
   * Callback for when the transaction is included in a block.
   */
  onInBlock?: (status: ExtrinsicStatus) => void;
  /**
   * Callback for when the transaction is finalized.
   */
  onFinalized?: (status: ExtrinsicStatus) => void;
  /**
   * Callback for when an error occurs.
   */
  onError?: (error: unknown) => void;
  /**
   * Callback for sygmaBridge.Deposit event on finalize stage
   */
  onDepositEvent?: (data: DepositEventDataType) => void;
};
