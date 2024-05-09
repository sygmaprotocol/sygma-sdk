import type { JsonRpcProvider } from '@ethersproject/providers';
import type { EvmResource } from '../../../src/types.js';
import { ResourceType } from '../../../src/types.js';
import { getEvmErc20Balance, getEvmHandlerBalance } from '../../../src/chains/evm/balances.js';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      ERC20__factory: {
        connect: jest.fn().mockReturnValue({
          balanceOf: jest.fn().mockReturnValue(0),
        }),
      },
    }) as unknown,
);

jest.mock(
  '@ethersproject/providers',
  () =>
    ({
      ...jest.requireActual('@ethersproject/providers'),
      JsonRpcProvider: jest.fn().mockReturnValue({
        getBalance: jest.fn().mockResolvedValue(0),
      }),
    }) as unknown,
);

describe('Evm Balances', () => {
  const mockedNativeResource: EvmResource = {
    sygmaResourceId: '0',
    caip19: '0',
    type: ResourceType.FUNGIBLE,
    iconUrl: '',
    native: true,
    burnable: false,
    symbol: 'ETH',
    decimals: 18,
    address: '0x0',
  };

  const mockedErc20Resource: EvmResource = {
    sygmaResourceId: '0',
    caip19: '0',
    type: ResourceType.FUNGIBLE,
    iconUrl: '',
    native: false,
    burnable: false,
    symbol: 'ETH',
    decimals: 18,
    address: '0x0',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides token balance', async function () {
    const address = '0x00';
    const tokenAddress = '0x00';

    const balance = await getEvmErc20Balance(
      address,
      tokenAddress,
      jest.fn() as unknown as JsonRpcProvider,
    );

    expect(balance).toEqual(0n);
  });

  it('should provide native handler balance', async function () {
    const balance = await getEvmHandlerBalance('', mockedNativeResource, '');
    expect(balance).toEqual(0n);
  });

  it('should provide erc20 handler balance', async function () {
    const balance = await getEvmHandlerBalance('', mockedErc20Resource, '');
    expect(balance).toEqual(0n);
  });
});
