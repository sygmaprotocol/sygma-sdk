import type { RawConfig } from '../types/index.js';
import { FeeHandlerType, Network, ResourceType } from '../types/index.js';

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
        {
          type: ResourceType.NON_FUNGIBLE,
          address: '0xC2D334e2f27A9dB2Ed8C4561De86C1A00EBf6760',
        },
        {
          type: ResourceType.PERMISSIONLESS_GENERIC,
          address: '0xE837D42dd3c685839a418886f418769BDD23546b',
        },
        {
          type: ResourceType.PERMISSIONED_GENERIC,
          address: '0xF28c11CB14C6d2B806f99EA8b138F65e74a1Ed66',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: BigInt(18),
      blockConfirmations: 1,
      startBlock: BigInt(3054823),
      feeRouter: '0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A',
      feeHandlers: [
        {
          address: '0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94',
          type: FeeHandlerType.BASIC,
        },
        {
          address: '0x30d704A60037DfE54e7e4D242Ea0cBC6125aE497',
          type: FeeHandlerType.DYNAMIC,
        },
      ],
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: ResourceType.FUNGIBLE,
          address: '0x37356a2B2EbF65e5Ea18BD93DeA6869769099739',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: ResourceType.NON_FUNGIBLE,
          address: '0xE54Dc792c226AEF99D6086527b98b36a4ADDe56a',
          symbol: 'ERC721TST',
          decimals: 18,
        },
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
      id: 2,
      chainId: 1338,
      name: 'evm2',
      type: Network.EVM,
      bridge: '0x6CdE2Cd82a4F8B74693Ff5e194c19CA08c2d1c68',
      handlers: [
        {
          type: ResourceType.FUNGIBLE,
          address: '0x02091EefF969b33A5CE8A729DaE325879bf76f90',
        },
        {
          type: ResourceType.NON_FUNGIBLE,
          address: '0xC2D334e2f27A9dB2Ed8C4561De86C1A00EBf6760',
        },
        {
          type: ResourceType.PERMISSIONLESS_GENERIC,
          address: '0xE837D42dd3c685839a418886f418769BDD23546b',
        },
        {
          type: ResourceType.PERMISSIONED_GENERIC,
          address: '0xF28c11CB14C6d2B806f99EA8b138F65e74a1Ed66',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: BigInt(18),
      blockConfirmations: 1,
      startBlock: BigInt(425),
      feeRouter: '0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A',
      feeHandlers: [
        {
          address: '0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94',
          type: FeeHandlerType.BASIC,
        },
        {
          address: '0x30d704A60037DfE54e7e4D242Ea0cBC6125aE497',
          type: FeeHandlerType.DYNAMIC,
        },
      ],
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: ResourceType.FUNGIBLE,
          address: '0x37356a2B2EbF65e5Ea18BD93DeA6869769099739',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: ResourceType.NON_FUNGIBLE,
          address: '0xE54Dc792c226AEF99D6086527b98b36a4ADDe56a',
          symbol: 'ERC721TST',
          decimals: 18,
        },
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
      nativeTokenFullName: 'pha',
      nativeTokenDecimals: BigInt(18),
      blockConfirmations: 1,
      bridge: '0x',
      parachainId: 0, // local setup is not parachain
      handlers: [
        {
          type: ResourceType.FUNGIBLE,
          address: '0x02091EefF969b33A5CE8A729DaE325879bf76f90',
        },
      ],
      startBlock: BigInt(5),
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: ResourceType.FUNGIBLE,
          assetName: 'USDC',
          assetID: 2000,
          xcmMultiAssetId: {
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
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: ResourceType.FUNGIBLE,
          native: true,
          decimals: 18,
          assetName: 'PHA',
          xcmMultiAssetId: {
            concrete: {
              parents: 0,
              interior: 'here',
            },
          },
        },
      ],
    },
  ],
};
