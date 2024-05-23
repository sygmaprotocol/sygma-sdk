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
          caip19: '',
          type: 'erc20',
          address: '0x3D151A97A446C9ea6893038e7C0db73466f3f3af',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          caip19: '',
          type: 'erc20',
          address: '0x3F9A68fF29B3d86a6928C44dF171A984F6180009',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          caip19: '',
          type: 'erc721',
          address: '0xe9d3b1433bACDfC26ee097629D238A41BF6dA3aE',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          sygmaResourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          caip19: '',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
  ],
};