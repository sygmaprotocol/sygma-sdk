import type { SubstrateResource } from '@buildwithsygma/core';
import type { ApiPromise } from '@polkadot/api';
import { constants } from 'ethers';

import { getAssetBalance } from './getAssetBalance.js';
import { getNativeTokenBalance } from './getNativeTokenBalance.js';

/**
 * Return amount of liquidity tokens on resource handler
 * @param provider
 * @param resource
 * @param handlerAddress
 */
export const getLiquidity = async (
  provider: ApiPromise,
  resource: SubstrateResource,
  handlerAddress: string,
): Promise<bigint> => {
  if (resource?.burnable) {
    return BigInt(constants.MaxUint256.toString());
  }

  if (resource.native) {
    const accountInfo = await getNativeTokenBalance(provider, handlerAddress);
    return BigInt(accountInfo.free.toString());
  } else {
    const assetBalance = await getAssetBalance(provider, resource.assetID ?? 0, handlerAddress);
    return BigInt(assetBalance.balance.toString());
  }
};
