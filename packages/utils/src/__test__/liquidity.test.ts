import { Network, ResourceType } from '@buildwithsygma/core';
import type { createEvmFungibleAssetTransfer } from '@buildwithsygma/evm';

import { hasEnoughLiquidity } from '../liquidity.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('web3-providers-http', () => ({
  ...jest.requireActual('web3-providers-http'),
  HttpProvider: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@buildwithsygma/evm', () => ({
  ...jest.requireActual('@buildwithsygma/evm'),
  getEvmHandlerBalance: jest.fn().mockResolvedValue(BigInt(5)),
}));

jest.mock('../substrate/balances.js', () => ({
  getSubstrateHandlerBalance: jest.fn().mockResolvedValue(BigInt(5)),
}));

const mockedHandler = {
  type: ResourceType.FUNGIBLE,
  address: '',
};

const mockedResource = {
  resourceId: '0x00',
  caip19: 'caipId',
  type: ResourceType.FUNGIBLE,
  address: '0x123',
};

const mockedDestination = {
  id: 1,
  caipId: 'caipId',
  chainId: 1,
  name: 'Chain',
  type: Network.EVM,
};

const mockedTransferEVM = {
  amount: 0n,
  resource: mockedResource,
  config: {
    findDomainConfig: jest.fn(),
  },
};

const mockedTransferSubstrate = {
  amount: 0n,
  resource: mockedResource,
  config: {
    findDomainConfig: jest.fn(),
  },
};

const destinationProviderUrl = 'mockedProviderUrl';

describe('hasEnoughLiquidity - EVM', () => {
  beforeAll(() => {
    Object.assign(mockedTransferEVM, { destination: mockedDestination });

    mockedTransferEVM.config.findDomainConfig.mockReturnValue({
      handlers: [mockedHandler],
      resources: [mockedResource],
    });
  });

  it('should return true if there is enough liquidity', async () => {
    mockedTransferEVM.amount = BigInt(1);

    const isEnough = await hasEnoughLiquidity(
      mockedTransferEVM as unknown as Awaited<ReturnType<typeof createEvmFungibleAssetTransfer>>,
      destinationProviderUrl,
    );

    expect(isEnough).toEqual(true);
  });

  it('should return false if there isnt enough liquidity', async () => {
    mockedTransferEVM.amount = BigInt(100);

    const isEnough = await hasEnoughLiquidity(
      mockedTransferEVM as unknown as Awaited<ReturnType<typeof createEvmFungibleAssetTransfer>>,
      destinationProviderUrl,
    );

    expect(isEnough).toEqual(false);
  });
  it('should throw error if handler is not found', async () => {
    const mockedTransferClone = Object.assign({}, mockedTransferEVM);
    mockedTransferClone.config.findDomainConfig = jest
      .fn()
      .mockReturnValue({ handlers: [], resources: [mockedResource] });

    await expect(
      hasEnoughLiquidity(
        mockedTransferClone as unknown as Awaited<
          ReturnType<typeof createEvmFungibleAssetTransfer>
        >,
        destinationProviderUrl,
      ),
    ).rejects.toThrow('Handler not found or unregistered for resource.');
  });
  it('should throw error if resource is not found', async () => {
    const mockedTransferClone = Object.assign({}, mockedTransferEVM);
    mockedTransferClone.config.findDomainConfig = jest
      .fn()
      .mockReturnValue({ handlers: [mockedHandler], resources: [] });

    await expect(
      hasEnoughLiquidity(
        mockedTransferClone as unknown as Awaited<
          ReturnType<typeof createEvmFungibleAssetTransfer>
        >,
        destinationProviderUrl,
      ),
    ).rejects.toThrow('Resource not found or unregistered.');
  });
});

describe('hasEnoughLiquidity - substrate', () => {
  beforeAll(() => {
    Object.assign(mockedTransferSubstrate, {
      destination: { ...mockedDestination, type: Network.SUBSTRATE },
    });

    mockedTransferSubstrate.config.findDomainConfig.mockReturnValue({
      handlers: [mockedHandler],
      resources: [mockedResource],
    });
  });

  it('should return true if there is enough liquidity', async () => {
    mockedTransferSubstrate.amount = BigInt(5);

    const isEnough = await hasEnoughLiquidity(
      mockedTransferSubstrate as unknown as Awaited<
        ReturnType<typeof createEvmFungibleAssetTransfer>
      >,
      destinationProviderUrl,
    );

    expect(isEnough).toEqual(true);
  });
  it('should return false if there isnt enough liquidity', async () => {
    mockedTransferSubstrate.amount = BigInt(10);

    const isEnough = await hasEnoughLiquidity(
      mockedTransferSubstrate as unknown as Awaited<
        ReturnType<typeof createEvmFungibleAssetTransfer>
      >,
      destinationProviderUrl,
    );

    expect(isEnough).toEqual(false);
  });
});

describe('hasEnoughLiquidity - error', () => {
  beforeAll(() => {
    Object.assign(mockedTransferEVM, {
      destination: { ...mockedDestination, type: 'foo' as unknown as Network },
    });

    mockedTransferEVM.config.findDomainConfig.mockReturnValue({
      handlers: [mockedHandler],
      resources: [mockedResource],
    });
  });

  it('should return false if network type is not supported', async () => {
    const isEnough = await hasEnoughLiquidity(
      mockedTransferEVM as unknown as Awaited<ReturnType<typeof createEvmFungibleAssetTransfer>>,
      destinationProviderUrl,
    );

    expect(isEnough).toEqual(false);
  });
});
