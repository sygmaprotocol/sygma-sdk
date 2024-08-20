import type { SubstrateResource } from '@buildwithsygma/core';
import { getAssetBalance, getNativeTokenBalance } from '@buildwithsygma/substrate';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';

export const getSubstrateHandlerBalance = async (
  destinationProviderUrl: string,
  resource: SubstrateResource,
  handlerAddress: string,
): Promise<bigint> => {
  const wsProvider = new WsProvider(destinationProviderUrl);
  const apiPromise = new ApiPromise({ provider: wsProvider });
  if (resource.native) {
    const accountInfo = await getNativeTokenBalance(apiPromise, handlerAddress);
    return BigInt(accountInfo.free.toString());
  } else {
    const assetBalance = await getAssetBalance(apiPromise, resource.assetID ?? 0, handlerAddress);
    return BigInt(assetBalance.balance.toString());
  }
};
