import axios from 'axios';
import { BigNumber, providers } from 'ethers';
import MockAdapter from 'axios-mock-adapter';

import {
  Transfer,
  ResourceType,
  FungibleAmount,
  FeeHandlerType,
  Environment,
} from '../../../src/types';
import { testingConfigData } from '../../constants';
import { ConfigUrl } from '../../../src/constants';

jest.mock(
  '@buildwithsygma/sygma-contracts',
  () =>
    ({
      ...jest.requireActual('@buildwithsygma/sygma-contracts'),
      FeeHandlerRouter__factory: {
        connect: () => {
          return {
            _domainResourceIDToFeeHandlerAddress: jest.fn(() =>
              Promise.resolve('0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622'),
            ),
          };
        },
      },
    } as unknown),
);
const axiosMock = new MockAdapter(axios);
const calculateFeeMock = jest.mock('../../../src/chains/EVM/fee/basicFee', () => ({
  ...jest.requireActual('../../../src/chains/EVM/fee/basicFee'),
  calculateBasicFee: jest.fn().mockResolvedValue({
    fee: BigNumber.from('100'),
    type: FeeHandlerType.BASIC,
    handlerAddress: '0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622',
  }),
}));

describe('EVM asset transfer', () => {
  const mockProvider: Partial<providers.Provider> = {
    getFeeData: jest.fn().mockResolvedValue({ gasPrice: BigNumber.from(100) }),
    getNetwork: jest.fn().mockResolvedValue({
      chainId: 11155111,
    }),
  };

  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should successfully get basic fee', async function () {
    const { EVMAssetTransfer } = await import('../../../src/chains/EVM');
    axiosMock.onGet(ConfigUrl.DEVNET).reply(200, testingConfigData);
    const assetTransfer = new EVMAssetTransfer(mockProvider as providers.BaseProvider);
    await assetTransfer.init(Environment.DEVNET);
    const transfer: Transfer<FungibleAmount> = {
      to: {
        name: 'Sepolia',
        id: 3,
      },
      from: {
        name: 'Mumbai',
        id: 2,
      },
      resource: {
        resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
        address: '0x3690601896C289be2d894c3d1213405310D0a25C',
        type: ResourceType.FUNGIBLE,
        symbol: 'LR',
        decimals: 18,
      },
      sender: '0x3690601896C289be2d894c3d1213405310D0a25C',
      recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
      amount: {
        amount: '200',
      },
    };

    const fee = await assetTransfer.getFee(transfer);

    expect(fee).toEqual({
      fee: BigNumber.from('100'),
      type: FeeHandlerType.BASIC,
      handlerAddress: '0xC2a1E379E2d255F42f3F8cA7Be32E3C3E1767622',
    });
    expect(calculateFeeMock).toBeCalledWith();
  });
});
