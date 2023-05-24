import { AccountInfo } from '@polkadot/types/interfaces';
import { ethers } from 'ethers';
import { FeeHandlerType } from '../../../types';

export type XcmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior: {
      x3: Array<{ parachain: number } | { generalKey: [number, string] }>; // This is a tuple of length and value
    };
  };
};

export type SubstrateFee = {
  fee: ethers.BigNumber;
  type: FeeHandlerType;
  tokenAddress?: string;
  feeData?: string;
};

export type SubstrateAccountInfo = AccountInfo;
