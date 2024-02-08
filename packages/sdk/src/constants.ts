import { Environment } from './types/index.js';

export enum ConfigUrl {
  DEVNET = 'https://chainbridge-assets-stage.s3.us-east-2.amazonaws.com/shared-config-dev.json',
  TESTNET = 'https://chainbridge-assets-stage.s3.us-east-2.amazonaws.com/shared-config-test.json',
  MAINNET = 'https://sygma-assets-mainnet.s3.us-east-2.amazonaws.com/shared-config-mainnet.json',
}

export enum IndexerUrl {
  MAINNET = 'https://api.buildwithsygma.com',
  TESTNET = 'https://api.test.buildwithsygma.com',
}

export enum ExplorerUrl {
  MAINNET = 'https://scan.buildwithsygma.com',
  TESTNET = 'https://scan.test.buildwithsygma.com',
}

export type DomainMetadata = {
  url: string; // icon url
};

export type EnvironmentMetadata = {
  [key: number]: DomainMetadata;
};

export type EnvironmentMetadataConfigType = {
  [key in Environment]?: EnvironmentMetadata;
};

export const DomainMetadataConfig: EnvironmentMetadataConfigType = {
  [Environment.TESTNET]: {
    1: { url: 'https://scan.buildwithsygma.com/assets/icons/all.svg' },
    2: { url: 'https://scan.buildwithsygma.com/assets/icons/all.svg' },
    3: { url: 'https://scan.buildwithsygma.com/assets/icons/phala-black.svg' },
    4: { url: 'https://scan.buildwithsygma.com/assets/icons/base.svg' },
    5: { url: 'https://scan.buildwithsygma.com/assets/icons/cronos.svg' },
    6: { url: 'https://scan.buildwithsygma.com/assets/icons/all.svg' },
    7: { url: 'https://scan.buildwithsygma.com/assets/icons/polygon.svg' },
    8: { url: 'https://scan.buildwithsygma.com/assets/icons/arbitrum.svg' },
    9: { url: 'https://scan.buildwithsygma.com/assets/icons/gnosis.svg' },
  },
  [Environment.MAINNET]: {
    1: { url: 'https://scan.buildwithsygma.com/assets/icons/all.svg' },
    2: { url: 'https://scan.buildwithsygma.com/assets/icons/khala.svg' },
    3: { url: 'https://scan.buildwithsygma.com/assets/icons/phala.svg' },
    4: { url: 'https://scan.buildwithsygma.com/assets/icons/cronos.svg' },
    5: { url: 'https://scan.buildwithsygma.com/assets/icons/base.svg' },
    6: { url: 'https://scan.buildwithsygma.com/assets/icons/gnosis.svg' },
    7: { url: 'https://scan.buildwithsygma.com/assets/icons/polygon.svg' },
  },
};
