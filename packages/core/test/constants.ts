export const mockedDevnetConfig = {
  domains: [
    {
      chainId: 111,
      sygmaId: 112,
      caipId: 113,
      name: 'ethereum',
      type: 'evm',
      bridge: '0xb36C801f644908bAAe89b7C28ad57Af18638A6a9',
      handlers: [
        {
          type: 'erc20',
          address: '0xAf2DB8059Bd69ba9Ac4c59D25de1C87931e62448',
        },
        {
          type: 'erc721',
          address: '0x201cBF8199DbF982c05185869FE063A744d797e2',
        },
        {
          type: 'permissionedGeneric',
          address: '0xA7Fd03f0ac452b2BF84523e0384E260be7f75bc0',
        },
        {
          type: 'permissionlessGeneric',
          address: '0x549b6b372351837566A6A97e79c3847D535efF23',
        },
      ],
      parachainId: undefined,
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: 18,
      blockConfirmations: 5,
      startBlock: 7225328,
      feeHandlers: [
        {
          address: '0x81bbFC4aC5E731d9EAdb749a7e7A6E973CF7E399',
          type: 'basic',
        },
        {
          address: '0xF5703Fcf2bfFC33625857D8ae8994b3260AA3c1f',
          type: 'oracle',
        },
      ],
      resources: [
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'erc20',
          address: '0x3D151A97A446C9ea6893038e7C0db73466f3f3af',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: 'erc20',
          address: '0x3F9A68fF29B3d86a6928C44dF171A984F6180009',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: 'erc721',
          address: '0xe9d3b1433bACDfC26ee097629D238A41BF6dA3aE',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
  ],
};

export const mockedTestnetConfig = {
  domains: [
    {
      chainId: 211,
      sygmaId: 212,
      caipId: 213,
      name: 'polygon',
      type: 'evm',
      parachainId: undefined,
      bridge: '0x37313Ab1701fCfC5050E84B4E7f841abB588a1db',
      handlers: [
        {
          type: 'erc20',
          address: '0x1B3c399E65E9d414EA77ee88253c7dD180C77805',
        },
        {
          type: 'erc721',
          address: '0x8b10Ee8aecc9A586b7bcc89C06e1f9B9BD65328b',
        },
        {
          type: 'permissionedGeneric',
          address: '0x12D7Bd85484Efe0b1537Bf7f3951389B596813c5',
        },
        {
          type: 'permissionlessGeneric',
          address: '0x63C293b9d0E71619f37573D77C2d21841a1D9c1c',
        },
      ],
      nativeTokenSymbol: 'matic',
      nativeTokenFullName: 'matic',
      nativeTokenDecimals: 18,
      blockConfirmations: 5,
      startBlock: 27171235,
      feeHandlers: [
        {
          address: '0x2fD80b28DbA645A23d8Fb83EC428468a95F0Aa7a',
          type: 'basic',
        },
        {
          address: '0x22B21aaf747C94314c8040eB28557828f81aCE49',
          type: 'oracle',
        },
      ],
      resources: [
        {
          sygmaResourceId: '0x00',
          type: 'fungible',
          address: '0x0',
          symbol: 'ERC20',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x01',
          type: 'gmp',
          address: '0x0',
          symbol: 'ERC20',
          decimals: 18,
        },
      ],
    },
    {
      chainId: 221,
      sygmaId: 222,
      caipId: 223,
      name: 'polygon',
      type: 'evm',
      parachainId: undefined,
      bridge: '0x37313Ab1701fCfC5050E84B4E7f841abB588a1db',
      handlers: [
        {
          type: 'erc20',
          address: '0x1B3c399E65E9d414EA77ee88253c7dD180C77805',
        },
        {
          type: 'erc721',
          address: '0x8b10Ee8aecc9A586b7bcc89C06e1f9B9BD65328b',
        },
        {
          type: 'permissionedGeneric',
          address: '0x12D7Bd85484Efe0b1537Bf7f3951389B596813c5',
        },
        {
          type: 'permissionlessGeneric',
          address: '0x63C293b9d0E71619f37573D77C2d21841a1D9c1c',
        },
      ],
      nativeTokenSymbol: 'matic',
      nativeTokenFullName: 'matic',
      nativeTokenDecimals: 18,
      blockConfirmations: 5,
      startBlock: 27171235,
      feeHandlers: [
        {
          address: '0x2fD80b28DbA645A23d8Fb83EC428468a95F0Aa7a',
          type: 'basic',
        },
        {
          address: '0x22B21aaf747C94314c8040eB28557828f81aCE49',
          type: 'oracle',
        },
      ],
      resources: [
        {
          sygmaResourceId: '0x00',
          type: 'erc20',
          address: '0x0',
          symbol: 'ERC20',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x01',
          type: 'erc20',
          address: '0x0',
          symbol: 'ERC20',
          decimals: 18,
        },
      ],
    },
  ],
};

export const mockedMainnetConfig = {
  domains: [
    {
      chainId: 311,
      sygmaId: 312,
      caipId: 313,
      name: 'Sepolia',
      type: 'evm',
      parachainId: undefined,
      bridge: '0x0',
      handlers: [
        {
          type: 'erc20',
          address: '0x0',
        },
        {
          type: 'erc721',
          address: '0x0',
        },
        {
          type: 'permissionedGeneric',
          address: '0x0',
        },
        {
          type: 'permissionlessGeneric',
          address: '0x0',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: 18,
      blockConfirmations: 5,
      startBlock: 3054823,
      feeHandlers: [
        {
          address: '0x0',
          type: 'basic',
        },
        {
          address: '0x0',
          type: 'oracle',
        },
      ],
      resources: [
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'erc20',
          address: '0x4cADdede58D2486e496f47c7BFfb18A7b36c4EE8',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: 'erc20',
          address: '0xe34E118597BF140F1816e721fEF85F1CF1fEf990',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: 'erc721',
          address: '0x5d51B20d31aEdeee4Db6328890b8fD04d83432e6',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
    {
      chainId: 321,
      sygmaId: 322,
      caipId: 323,
      name: 'Sepolia',
      type: 'evm',
      parachainId: undefined,
      bridge: '0x0',
      handlers: [
        {
          type: 'erc20',
          address: '0x0',
        },
        {
          type: 'erc721',
          address: '0x0',
        },
        {
          type: 'permissionedGeneric',
          address: '0x0',
        },
        {
          type: 'permissionlessGeneric',
          address: '0x0',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: 18,
      blockConfirmations: 5,
      startBlock: 3054823,
      feeHandlers: [
        {
          address: '0x0',
          type: 'basic',
        },
        {
          address: '0x0',
          type: 'oracle',
        },
      ],
      resources: [
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'erc20',
          address: '0x4cADdede58D2486e496f47c7BFfb18A7b36c4EE8',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: 'erc20',
          address: '0xe34E118597BF140F1816e721fEF85F1CF1fEf990',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: 'erc721',
          address: '0x5d51B20d31aEdeee4Db6328890b8fD04d83432e6',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
  ],
};
