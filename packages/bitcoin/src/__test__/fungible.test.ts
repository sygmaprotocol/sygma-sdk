import { Config, Environment } from '@buildwithsygma/core';
import * as bitcoin from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import * as tinysecp from 'tiny-secp256k1';

import { createBitcoinFungibleTransfer } from '../fungible.js';
import type { BitcoinTransferParams } from '../types.js';
import { TypeOfAddress } from '../types.js';

bitcoin.initEccLib(tinysecp);

const P2TR_TRANSFER_PARAMS: BitcoinTransferParams = {
  sourceAddress: 'tb1pxmrzd94rs6wtg6ewdjfmuu7s88n2kdqc20vzfmadanfaem3n9sdq0vagu0',
  source: 'bip122:000000000933ea01ad0ee984209779ba',
  destination: 1,
  destinationAddress: '0x98729c03c4D5e820F5e8c45558ae07aE63F97461',
  amount: BigInt(90000000),
  resource: '0x0000000000000000000000000000000000000000000000000000000000000300',
  utxoData: [
    {
      utxoTxId: 'dbcd2f7e54392fbfeca85d15ce405dfecddc65c42e6f72a1b84c79dcd2eb7e7c',
      utxoAmount: BigInt(100000000),
      utxoOutputIndex: 0,
    },
  ],
  publicKey: toXOnly(
    Buffer.from('03feca449bd5b50085d23864a006f6ea4da80ff63816033f6437193c66bac7488c', 'hex'),
  ),
  typeOfAddress: TypeOfAddress.P2TR,
  network: bitcoin.networks.testnet,
  changeAddress: 'tb1pxmrzd94rs6wtg6ewdjfmuu7s88n2kdqc20vzfmadanfaem3n9sdq0vagu0',
  environment: Environment.DEVNET,
  feeRate: BigInt(103),
  size: BigInt(400),
};

const P2PWKH_TRANSFER_PARAMS: BitcoinTransferParams = {
  ...P2TR_TRANSFER_PARAMS,
  typeOfAddress: TypeOfAddress.P2WPKH,
  publicKey: Buffer.from(
    '03feca449bd5b50085d23864a006f6ea4da80ff63816033f6437193c66bac7488c',
    'hex',
  ),
};

const MOCKED_CONFIG = {
  init: jest.fn(),
  getDomainConfig: jest
    .fn()
    .mockReturnValue({ bridge: '', caipId: 'bip122:000000000933ea01ad0ee984209779ba' }),
  getDomain: jest.fn().mockReturnValue({
    caipId: 'bip122:000000000933ea01ad0ee984209779ba',
    feeAddress: 'tb1p0r2w3ugreaggd7nakw2wd04up6rl8k0cce8eetxwmhnrelgqx87s4zdkd7',
  }),
  getResources: jest.fn().mockReturnValue([
    {
      resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
      type: 'fungible',
      address: 'tb1pxmrzd94rs6wtg6ewdjfmuu7s88n2kdqc20vzfmadanfaem3n9sdq0vagu0',
      decimals: 8,
      tweak: 'd97ae87c238a8a674bff71db5eeb69519dbd1c57bec70a89f7b06fa2d0e97841',
      feeAmount: '1000000',
    },
  ]),
  findDomainConfigBySygmaId: jest
    .fn()
    .mockReturnValue({ caipId: 'bip122:000000000933ea01ad0ee984209779ba' }),
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@buildwithsygma/core', () => ({
  ...jest.requireActual('@buildwithsygma/core'),
  Config: jest.fn(),
}));

describe('Fungible - createBitcoinFungibleTransfer', () => {
  beforeAll(() => {
    (Config as jest.Mock).mockReturnValue(MOCKED_CONFIG);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('Fungible - createBitcoinFungibleTransfer - P2TR', () => {
    it('should create a bitcoin fungible transfer', async () => {
      const transfer = await createBitcoinFungibleTransfer(P2TR_TRANSFER_PARAMS);
      expect(transfer).toBeTruthy();
    });

    it('should throw an error when resource is not found', async () => {
      const transferParams = { ...P2TR_TRANSFER_PARAMS, resource: 'tb...' };
      const transfer = createBitcoinFungibleTransfer(transferParams);
      await expect(transfer).rejects.toThrow('Resource not found.');
    });

    it('should return PSBT instance', async () => {
      const transfer = await createBitcoinFungibleTransfer(P2TR_TRANSFER_PARAMS);
      const psbt = transfer.getTransferTransaction();
      expect(psbt).toBeTruthy();
      expect(psbt instanceof bitcoin.Psbt).toBeTruthy();
    });

    it('should throw if the utxo amount is equal to the amount to transfer', async () => {
      const transferParams = { ...P2TR_TRANSFER_PARAMS, amount: BigInt(100000000) };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      expect(() => transfer.getTransferTransaction()).toThrow();
    });

    it('should throw if the utxo amount is less than the amount to transfer', async () => {
      const transferParams = { ...P2TR_TRANSFER_PARAMS, amount: BigInt(100000001) };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      expect(() => transfer.getTransferTransaction()).toThrow();
    });

    it('should throw if public key is incorrect', async () => {
      const transferParams = { ...P2TR_TRANSFER_PARAMS, publicKey: Buffer.from('', 'hex') };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      expect(() => transfer.getTransferTransaction()).toThrow();
    });

    it('should throw if utxoData is partially defined', async () => {
      const transferParams: BitcoinTransferParams = {
        ...P2TR_TRANSFER_PARAMS,
        utxoData: [
          {
            utxoTxId: 'dbcd2f7e54392fbfeca85d15ce405dfecddc65c42e6f72a1b84c79dcd2eb7e7c',
          },
        ] as unknown as BitcoinTransferParams['utxoData'],
      };
      const transfer = await createBitcoinFungibleTransfer(transferParams);

      expect(() => transfer.getTransferTransaction()).toThrow();
    });
    it('should throw given an array of multiples utxo and amount thats bigger than the sum of the values', async () => {
      const transferParams: BitcoinTransferParams = {
        ...P2TR_TRANSFER_PARAMS,
        utxoData: [
          {
            utxoTxId: 'dbcd2f7e54392fbfeca85d15ce405dfecddc65c42e6f72a1b84c79dcd2eb7e7c',
            utxoAmount: BigInt(100000000),
            utxoOutputIndex: 0,
          },
          {
            utxoTxId: '56796b5daa09cf5299784593a369669090d26cc70e96b6e5a1a510a417054b21',
            utxoAmount: BigInt(100000000),
            utxoOutputIndex: 0,
          },
        ],
        amount: BigInt(600000000),
      };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      expect(() => transfer.getTransferTransaction()).toThrow();
    });

    it('should process multiple utxo inputs and create a valid PSBT', async () => {
      const transferParams: BitcoinTransferParams = {
        ...P2TR_TRANSFER_PARAMS,
        utxoData: [
          {
            utxoTxId: 'dbcd2f7e54392fbfeca85d15ce405dfecddc65c42e6f72a1b84c79dcd2eb7e7c',
            utxoAmount: BigInt(100000000),
            utxoOutputIndex: 0,
          },
          {
            utxoTxId: '56796b5daa09cf5299784593a369669090d26cc70e96b6e5a1a510a417054b21',
            utxoAmount: BigInt(100000000),
            utxoOutputIndex: 0,
          },
        ],
        amount: BigInt(3000000),
      };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      const psbt = transfer.getTransferTransaction();
      expect(psbt).toBeTruthy();
    });
  });

  describe('Fungible - createBitcoinFungibleTransfer - P2WPKH', () => {
    it('should create a bitcoin fungible transfer', async () => {
      const transfer = await createBitcoinFungibleTransfer(P2PWKH_TRANSFER_PARAMS);
      expect(transfer).toBeTruthy();
    });

    it('should throw an error when resource is not found', async () => {
      const transferParams = { ...P2PWKH_TRANSFER_PARAMS, resource: 'tb...' };
      const transfer = createBitcoinFungibleTransfer(transferParams);
      await expect(transfer).rejects.toThrow('Resource not found.');
    });

    it('should return PSBT instance', async () => {
      const transfer = await createBitcoinFungibleTransfer(P2PWKH_TRANSFER_PARAMS);
      const psbt = transfer.getTransferTransaction();
      expect(psbt).toBeTruthy();
      expect(psbt instanceof bitcoin.Psbt).toBeTruthy();
    });

    it('should throw if the utxo amount is equal to the amount to transfer', async () => {
      const transferParams = { ...P2PWKH_TRANSFER_PARAMS, amount: BigInt(100000000) };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      expect(() => transfer.getTransferTransaction()).toThrow();
    });

    it('should throw if the utxo amount is less than the amount to transfer', async () => {
      const transferParams = { ...P2PWKH_TRANSFER_PARAMS, amount: BigInt(100000001) };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      expect(() => transfer.getTransferTransaction()).toThrow(
        'Not enough funds to spend from the UTXO',
      );
    });

    it('should throw if public key is incorrect', async () => {
      const transferParams = { ...P2PWKH_TRANSFER_PARAMS, publicKey: Buffer.from('', 'hex') };
      const transfer = await createBitcoinFungibleTransfer(transferParams);
      expect(() => transfer.getTransferTransaction()).toThrow();
    });

    it('should throw if utxoData is partially defined', async () => {
      const transferParams: BitcoinTransferParams = {
        ...P2PWKH_TRANSFER_PARAMS,
        utxoData: [
          {
            utxoTxId: 'dbcd2f7e54392fbfeca85d15ce405dfecddc65c42e6f72a1b84c79dcd2eb7e7c',
          },
        ] as unknown as BitcoinTransferParams['utxoData'],
      };
      const transfer = await createBitcoinFungibleTransfer(transferParams);

      expect(() => transfer.getTransferTransaction()).toThrow();
    });
  });
});
