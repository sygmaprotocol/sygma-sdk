import type { Eip1193Provider } from '@buildwithsygma/core';

export const ASSET_TRANSFER_PARAMS = {
  source: 1,
  destination: 2,
  sourceAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
  sourceNetworkProvider: jest.fn() as unknown as Eip1193Provider,
  recipientAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
  resource: {
    address: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
    resourceId: '0x0',
    caip19: '0x11',
  },
};
