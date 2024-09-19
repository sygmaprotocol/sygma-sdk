import { FeeHandlerType } from '@buildwithsygma/core';
import type { ethers } from 'ethers';
import { BigNumber } from 'ethers';

import type { EvmFee } from '../types.js';

export const ASSET_TRANSFER_GAS_LIMIT: BigNumber = BigNumber.from(300000);

export function getTransactionOverrides(
  fee: EvmFee,
  overrides?: ethers.Overrides,
): ethers.Overrides {
  const sygmaOverrides = {
    gasLimit: ASSET_TRANSFER_GAS_LIMIT,
    value: fee.type === FeeHandlerType.PERCENTAGE ? 0 : fee.fee,
  };

  return {
    ...sygmaOverrides,
    ...overrides,
  };
}
