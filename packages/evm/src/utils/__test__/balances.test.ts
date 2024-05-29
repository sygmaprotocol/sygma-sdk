import type { EvmResource } from '@buildwithsygma/core';
import type { Bridge } from '@buildwithsygma/sygma-contracts';

import type { Eip1193Provider } from '../../types.js';
import { getEvmErc20Balance, getEvmHandlerBalance } from '../balances.js';

jest.mock('@buildwithsygma/sygma-contracts', () => {
  return {
    ...jest.requireActual('@buildwithsygma/sygma-contracts'),
    ERC20__factory: {
      connect: jest.fn().mockReturnValue({
        balanceOf: jest.fn().mockResolvedValue({
          toBigInt: () => 0n,
          toString: () => '0',
        }),
      }) as unknown as Bridge,
    },
  } as unknown;
});

jest.mock('@ethersproject/providers', () => {
  return {
    ...jest.requireActual('@ethersproject/providers'),
    Web3Provider: jest.fn().mockReturnValue({
      getBalance: jest.fn().mockResolvedValue({
        toBigInt: () => 0n,
        toString: () => '0',
      }),
    }),
  } as unknown;
});

// Define a test suite
describe('Balances', () => {
  const provider = jest.fn() as unknown as Eip1193Provider;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should provide erc20 balance', async function () {
    const balance = await getEvmErc20Balance(provider, '', '');
    expect(balance).toEqual(0n);
  });

  it('Should provide native handler balance', async function () {
    const nativeHandlerBalance = await getEvmHandlerBalance(
      provider,
      { native: true } as unknown as EvmResource,
      '',
    );
    expect(nativeHandlerBalance).toEqual(0n);
  });

  it('Should provide erc20 handler balance', async function () {
    const nativeHandlerBalance = await getEvmHandlerBalance(
      provider,
      { native: false } as unknown as EvmResource,
      '',
    );
    expect(nativeHandlerBalance).toEqual(0n);
  });
});
