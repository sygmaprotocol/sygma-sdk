import type { Domain, FeeHandlerType, SubstrateResource } from '@buildwithsygma/core';
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
