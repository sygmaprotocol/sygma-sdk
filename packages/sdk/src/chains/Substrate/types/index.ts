import { ethers } from 'ethers';
import { FeeHandlerType } from 'types';

export type XcmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior: {
      x3: Array<{ parachain: number } | { generalKey: string }>;
    };
  };
};

export type SubstrateFee = {
  fee: ethers.BigNumber;
  type: FeeHandlerType;
  handlerAddress: string;
  tokenAddress?: string;
  feeData?: string;
};
