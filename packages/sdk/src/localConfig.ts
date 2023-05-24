import { FeeHandlerType, Network, RawConfig, ResourceType } from './types';

export const localConfig: RawConfig = {
  domains: [
    {
      id: 1,
      chainId: 1337,
      name: 'Ethereum 1',
      type: Network.EVM,
      bridge: '0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68',
      handlers: [
        {
          type: ResourceType.FUNGIBLE,
          address: '0x02091EefF969b33A5CE8A729DaE325879bf76f90',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenName: 'ether',
      nativeTokenDecimals: BigInt(18),
      blockConfirmations: 3,
      startBlock: BigInt(3054823),
      feeRouter: '0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A',
      feeHandlers: [
        {
          address: '0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94',
          type: FeeHandlerType.BASIC,
        },
      ],
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: ResourceType.FUNGIBLE,
          address: '0x78E5b9cEC9aEA29071f070C8cC561F692B3511A6',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
      ],
    },
    {
      id: 3,
      chainId: 5,
      name: 'Substrate',
      type: Network.SUBSTRATE,
      nativeTokenSymbol: 'pha',
      nativeTokenName: 'pha',
      nativeTokenDecimals: BigInt(18),
      blockConfirmations: 1,
      bridge: '0x',
      handlers: [
        {
          type: ResourceType.FUNGIBLE,
          address: '0x02091EefF969b33A5CE8A729DaE325879bf76f90',
        },
      ],
      startBlock: BigInt(1),
      resources: [
        // I am pretty sure this is mapped to ERC20LRTest token, but
        // we'll have to change shared config to match all the added fields
        // so please figure out the best format and what we actually need and then
        // we'll add it to the configurations.
        {
          resourceId: '0x',
          type: ResourceType.FUNGIBLE,
          assetName: 'USDC',
          assetId: 2000,
          xsmMultiAssetId: {
            concrete: {
              parents: 1,
              interior: {
                x3: [
                  { parachain: 2004 },
                  {
                    generalKey: [
                      5,
                      '0x7379676d61000000000000000000000000000000000000000000000000000000',
                    ],
                  },
                  {
                    generalKey: [
                      4,
                      '0x7573646300000000000000000000000000000000000000000000000000000000',
                    ],
                  },
                ],
              },
            },
          },
        },
      ],
    },
  ],
};
