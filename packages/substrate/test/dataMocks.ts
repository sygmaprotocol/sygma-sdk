import { FeeHandlerType, Network, ResourceType, SygmaConfig } from '@buildwithsygma/core';

const domainsMock: SygmaConfig = {
  domains: [
    {
      id: 2,
      chainId: 11155111,
      caipId: 'caipId',
      name: 'sepolia',
      type: Network.EVM,
      bridge: '0x4CF326d3817558038D1DEF9e76b727202c3E8492',
      handlers: [
        {
          type: ResourceType.FUNGIBLE,
          address: '0xa65387feCb172ffF8A0aabA323A10c63757BBFA6',
        },
        {
          type: ResourceType.NON_FUNGIBLE,
          address: '0x669F52487ffA6f9aBf722082f735537A98Ec0E4b',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: BigInt(18),
      blockConfirmations: 5,
      startBlock: BigInt(5703542),
      feeRouter: '0xCF4324adDf2ECA0181A2A0F5176ef61D115C0ae4',
      feeHandlers: [
        {
          address: '0xb71adf39D4Bc4EbC5b8a5A514d921dB269AFAcff',
          type: FeeHandlerType.BASIC,
        },
        {
          address: '0xcEc8b912DdfC25F381EDC11D0629652EC2022265',
          type: FeeHandlerType.PERCENTAGE,
        },
      ],
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: ResourceType.NON_FUNGIBLE,
          address: '0x285207Cbed7AF3Bc80E05421D17AE1181d63aBd0',
          symbol: 'ERC721TST',
          decimals: 0,
          caip19: '',
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: ResourceType.FUNGIBLE,
          address: '0x7d58589b6C1Ba455c4060a3563b9a0d447Bef9af',
          symbol: 'ERC20LRTest',
          decimals: 18,
          caip19: '',
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001100',
          type: ResourceType.FUNGIBLE,
          address: '0xA9F30c6B5E7996D1bAd51D213277c30750bcBB36',
          symbol: 'sygUSD',
          decimals: 18,
          caip19: '',
        },
      ],
    },
    {
      id: 3,
      chainId: 5231,
      parachainId: 2004,
      caipId: 'caipId',
      name: 'rococo-phala',
      type: Network.SUBSTRATE,
      bridge: '',
      handlers: [
        {
          address: '5EYCAe5jLbHcAAMKvLFSXgCTbPrLgBJusvPwfKcaKzuf5X5e',
          type: ResourceType.FUNGIBLE,
        },
      ],
      nativeTokenSymbol: 'pha',
      nativeTokenFullName: 'pha',
      nativeTokenDecimals: BigInt(12),
      blockConfirmations: 2,
      startBlock: BigInt(853611),
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001000',
          type: ResourceType.FUNGIBLE,
          caip19: '',
          native: true,
          symbol: 'PHA',
          decimals: 12,
          assetName: 'Phala',
          xcmMultiAssetId: {
            concrete: {
              parents: 0,
              interior: 'here',
            },
          },
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001100',
          type: ResourceType.FUNGIBLE,
          caip19: '',
          assetID: 1984,
          native: false,
          symbol: 'sygUSD',
          decimals: 6,
          assetName: 'SygmaUSD',
          xcmMultiAssetId: {
            concrete: {
              parents: 1,
              interior: {
                x3: [
                  {
                    parachain: 1000,
                  },
                  {
                    generalKey: [
                      6,
                      '0x7379675553440000000000000000000000000000000000000000000000000000',
                    ],
                  },
                ],
              },
            },
          },
        },
      ],
    },
    {
      id: 10,
      chainId: 84532,
      caipId: 'caipId',
      name: 'base_sepolia',
      type: Network.EVM,
      bridge: '0x9D5C332Ebe0DaE36e07a4eD552Ad4d8c5067A61F',
      handlers: [
        {
          type: ResourceType.FUNGIBLE,
          address: '0x72a588B76025d552B239532C31fB7D5Cc80A3e41',
        },
        {
          type: ResourceType.PERMISSIONLESS_GENERIC,
          address: '0x7f4e1E62A0Abd4A381254335CeF5770F74b3E22E',
        },
        {
          type: ResourceType.PERMISSIONLESS_GENERIC,
          address: '0xfd69bbfcCbfc832C56Ca1490df48B4baF3DfD376',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: BigInt(18),
      blockConfirmations: 5,
      startBlock: BigInt(8708492),
      feeRouter: '0x772e242e6c312f6eF6255d8F35921e7A30D018BA',
      feeHandlers: [
        {
          address: '0xde937016D67811f08D93ee54093ea686C21d211C',
          type: FeeHandlerType.BASIC,
        },
        {
          address: '0x4430E5D4447Df0FC25adCafEb8b5E49d38B56e21',
          type: FeeHandlerType.PERCENTAGE,
        },
      ],
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: ResourceType.PERMISSIONLESS_GENERIC,
          address: '',
          symbol: '',
          decimals: 18,
          caip19: '',
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000600',
          type: ResourceType.PERMISSIONLESS_GENERIC,
          address: '',
          symbol: 'eth',
          decimals: 18,
          caip19: '',
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001100',
          type: ResourceType.FUNGIBLE,
          address: '0xb947F89269F0cF54CC721BcDE298a46930f3418b',
          symbol: 'sygUSD',
          decimals: 18,
          caip19: '',
        },
      ],
    },
  ],
};

export { domainsMock };
