import type { SubstrateResource } from '@buildwithsygma/core';
import { ResourceType } from '@buildwithsygma/core';
import type { ApiPromise } from '@polkadot/api';
import type { AccountData, AssetBalance } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { constants } from 'ethers';

import { getAssetBalance } from '../../utils/getAssetBalance.js';
import { getLiquidity } from '../../utils/getLiquidity.js';
import { getNativeTokenBalance } from '../../utils/getNativeTokenBalance.js';

jest.mock('../../utils/getAssetBalance');
jest.mock('../../utils/getNativeTokenBalance');

const mockGetAssetBalance = getAssetBalance as jest.MockedFunction<typeof getAssetBalance>;
const mockGetNativeTokenBalance = getNativeTokenBalance as jest.MockedFunction<
  typeof getNativeTokenBalance
>;

describe('getLiquidity', () => {
  const handlerAddress = 'handlerAddress';
  const resourceBase: SubstrateResource = {
    resourceId: '1',
    caip19: 'caip-19',
    type: ResourceType.FUNGIBLE,
    assetName: 'Asset Name',
    xcmMultiAssetId: { concrete: { parents: 1, interior: 'here' } },
    burnable: false,
    native: true,
  };

  let mockApi: ApiPromise;

  beforeEach(() => {
    mockApi = {
      query: {
        system: {
          account: jest.fn(),
        },
      },
    } as unknown as ApiPromise;
  });

  it('should return MaxUint256 for burnable resources', async () => {
    const burnableResource = { ...resourceBase, burnable: true, native: false };

    const result = await getLiquidity(mockApi, burnableResource, handlerAddress);

    expect(result).toBe(BigInt(constants.MaxUint256.toString()));
  });

  it('should return native token balance for native resources', async () => {
    const nativeResource = { ...resourceBase, burnable: false, native: true };

    const mockAccountData = { free: new BN(1000) } as AccountData;
    mockGetNativeTokenBalance.mockResolvedValue(mockAccountData);

    const result = await getLiquidity(mockApi, nativeResource, handlerAddress);

    expect(result).toBe(BigInt(mockAccountData.free.toString()));
    expect(mockGetNativeTokenBalance).toHaveBeenCalledWith(mockApi, handlerAddress);
  });

  it('should return asset balance for non-native, non-burnable resources', async () => {
    const nonNativeAndNonBurnableResource = {
      ...resourceBase,
      burnable: false,
      native: false,
      assetID: 1,
    };

    const mockAssetBalance = { balance: new BN(2000) } as AssetBalance;
    mockGetAssetBalance.mockResolvedValue(mockAssetBalance);

    const result = await getLiquidity(mockApi, nonNativeAndNonBurnableResource, handlerAddress);

    expect(result).toBe(BigInt(mockAssetBalance.balance.toString()));
    expect(mockGetAssetBalance).toHaveBeenCalledWith(
      mockApi,
      nonNativeAndNonBurnableResource.assetID,
      handlerAddress,
    );
  });
});
