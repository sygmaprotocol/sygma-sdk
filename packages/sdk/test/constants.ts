export const testingConfigData = {
  domains: [
    {
      id: 0,
      chainId: 6,
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
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'erc20',
          address: '0x3D151A97A446C9ea6893038e7C0db73466f3f3af',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: 'erc20',
          address: '0x3F9A68fF29B3d86a6928C44dF171A984F6180009',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: 'erc721',
          address: '0xe9d3b1433bACDfC26ee097629D238A41BF6dA3aE',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
    {
      id: 1,
      name: 'polygon',
      chainId: 80001,
      type: 'evm',
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
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'erc20',
          address: '0x2465c8F84bDB7130ACDf31d694bc9c820F70ac06',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: 'erc20',
          address: '0xFC072Aa8ABB5646aFD0c22994bdE30dB57B1BF1C',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: 'erc721',
          address: '0x4beD477d1f5D338855A521ABa2A88c9a15e2eA5d',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
    {
      id: 2,
      name: 'moonbeam',
      chainId: 1287,
      type: 'evm',
      bridge: '0x6CAf9103c8cE3c9C347D57Aee39E8e66e43091b8',
      handlers: [
        {
          type: 'erc20',
          address: '0x40e273C40349dCA9062F9a3B80BAdFF000512c1F',
        },
        {
          type: 'erc721',
          address: '0xF5703Fcf2bfFC33625857D8ae8994b3260AA3c1f',
        },
        {
          type: 'permissionedGeneric',
          address: '0xd698e309735d0Dab4e0F0358Ed68512b58062945',
        },
        {
          type: 'permissionlessGeneric',
          address: '0x09000C7786C34C79aa21a55942f12E7Bb69e772e',
        },
      ],
      nativeTokenSymbol: 'glmr',
      nativeTokenFullName: 'dev',
      nativeTokenDecimals: 18,
      blockConfirmations: 5,
      startBlock: 2916751,
      feeHandlers: [
        {
          address: '0x2AF8df30309A0c68Af6D5FD5bd5E5D2005A40fE6',
          type: 'basic',
        },
        {
          address: '0x1C28f6A4B4F89dd87e093d86c4878c865C691F89',
          type: 'oracle',
        },
      ],
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'erc20',
          address: '0xAc693E44E1EDe5f66A4e1406F65b904450932fB3',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: 'erc20',
          address: '0x3690601896C289be2d894c3d1213405310D0a25C',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: 'erc721',
          address: '0x3D151A97A446C9ea6893038e7C0db73466f3f3af',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
    {
      id: 3,
      chainId: 11155111,
      name: 'Sepolia',
      type: 'evm',
      bridge: '0x59d52E04d4521C0e6C78310f4c4FF9167BA71d01',
      handlers: [
        {
          type: 'erc20',
          address: '0x03896BaeA3A8CD98E46C576AF6Ceaffb69a51AFB',
        },
        {
          type: 'erc721',
          address: '0x9DA05ec79e82D2441D09ddE3B616710668eA0c33',
        },
        {
          type: 'permissionedGeneric',
          address: '0x67c5DAdd58b2a0818B291f292F17f72094952bA9',
        },
        {
          type: 'permissionlessGeneric',
          address: '0x3d60e7Fb97695648013e373186e3C8f5854ed434',
        },
      ],
      nativeTokenSymbol: 'eth',
      nativeTokenFullName: 'ether',
      nativeTokenDecimals: 18,
      blockConfirmations: 5,
      startBlock: 3054823,
      feeHandlers: [
        {
          address: '0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622',
          type: 'basic',
        },
        {
          address: '0xe495c86962DcA7208ECcF2020A273395AcE8da3e',
          type: 'oracle',
        },
        {
          address: '0xunsupported',
          type: 'unsupported',
        },
      ],
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'erc20',
          address: '0x4cADdede58D2486e496f47c7BFfb18A7b36c4EE8',
          symbol: 'ERC20TST',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
          type: 'erc20',
          address: '0xe34E118597BF140F1816e721fEF85F1CF1fEf990',
          symbol: 'ERC20LRTest',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000200',
          type: 'erc721',
          address: '0x5d51B20d31aEdeee4Db6328890b8fD04d83432e6',
          symbol: 'ERC721TST',
          decimals: 0,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000500',
          type: 'permissionlessGeneric',
          address: '',
          symbol: '',
          decimals: 0,
        },
      ],
    },
    {
      id: 5,
      chainId: 400,
      name: 'rococo-phala',
      type: 'substrate',
      bridge: '',
      handlers: [],
      nativeTokenSymbol: 'pha',
      nativeTokenFullName: 'pha',
      nativeTokenDecimals: 18,
      blockConfirmations: 2,
      startBlock: 468700,
      resources: [
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000001000',
          type: 'fungible',
          address: '',
          symbol: 'PHA',
          decimals: 18,
        },
        {
          resourceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
          type: 'fungible',
          address: '',
          symbol: 'ERC20TST',
          decimals: 18,
        },
      ],
    },
  ],
};
