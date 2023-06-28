import { AccountInfo } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { FeeHandlerType } from '../../../types';

export type XcmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior:
    | 'here'
    | {
      x3: Array<{ parachain: number } | { generalKey: [number, string] }>; // This is a tuple of length and value
    };
  };
};

export type SubstrateFee = {
  fee: BN;
  type: FeeHandlerType;
};

export type SubstrateAccountInfo = AccountInfo;
