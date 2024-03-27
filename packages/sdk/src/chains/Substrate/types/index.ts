import type { AccountInfo } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { FeeHandlerType } from '../../../types/index.js';

export type SygmaFeeHandlerRouterFeeHandlerType =
  | 'BasicFeeHandler'
  | 'PercentageFeeHandler'
  | 'DynamicFeeHandler';

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

export enum KusamaParachain {
  STATEMINE = 1000,
  BIFROST = 2001,
  SHIDEN = 2007,
  MOONRIVER = 2023,
  KARURA = 2000,
  PARALLEL_HEIKO = 2085,
  BASILISK = 2090,
  CRAB = 2105,
  CALAMARI = 2084,
  TURING = 2114,
}

export enum PolkadotParachain {
  STATEMINT = 1000,
  ASTAR = 2006,
  MOONBEAM = 2004,
  BIFROST = 2030,
  PARALLEL = 2012,
  HYDRADX = 2034,
  DARWINIA = 2046,
  EQUILIBRIUM = 2011,
  COMPOSABLE = 2019,
}

export enum RococoParachain {
  RHALA = 2004,
}

export type ParachainID = KusamaParachain | PolkadotParachain | RococoParachain | number;
