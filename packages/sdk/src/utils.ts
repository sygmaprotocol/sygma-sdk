import { IndexerUrl, ExplorerUrl } from './constants.js';
import type { TransferStatus, TransferStatusResponse } from './types/index.js';
import { Environment } from './types/index.js';

export const DEVNET_FEE_ORACLE_BASE_URL: string = 'https://fee-oracle.develop.buildwithsygma.com/';
export const TESTNET_FEE_ORACLE_BASE_URL: string = 'https://fee-oracle.test.buildwithsygma.com/';
export const MAINNET_FEE_ORACLE_BASE_URL: string = '';

export function getFeeOracleBaseURL(environment?: Environment): string {
  switch (environment) {
    case Environment.DEVNET:
      return DEVNET_FEE_ORACLE_BASE_URL;
    case Environment.TESTNET:
      return TESTNET_FEE_ORACLE_BASE_URL;
    case Environment.MAINNET:
    default:
      return MAINNET_FEE_ORACLE_BASE_URL;
  }
}

/**
 * @@description Get the status of a transfer using transaction hash and optionally domain id
 */
export async function getTransferStatusData(
  environment: Environment,
  txHash: string,
): Promise<TransferStatusResponse[]>;
export async function getTransferStatusData(
  environment: Environment,
  txHash: string,
  domainId: string,
): Promise<TransferStatusResponse>;
export async function getTransferStatusData(
  environment: Environment,
  txHash: string,
  domainId?: string,
): Promise<TransferStatusResponse | TransferStatusResponse[]> {
  let url: string;
  let explorerUrl: string;

  if (environment === Environment.TESTNET) {
    url = `${IndexerUrl.TESTNET}/api/transfers/txHash/${txHash}`;
    explorerUrl = `${ExplorerUrl.TESTNET}/transfer/${txHash}`;
  } else if (environment === Environment.MAINNET) {
    url = `${IndexerUrl.MAINNET}/api/transfers/txHash/${txHash}`;
    explorerUrl = `${ExplorerUrl.MAINNET}/transfer/${txHash}`;
  } else {
    throw new Error('Invalid environment');
  }

  const response = await fetch(url);
  const data = (await response.json()) as (Record<string, unknown> & {
    status: TransferStatus;
    toDomainId: number;
  })[];

  if (domainId) {
    const record = data.find(data => data.toDomainId === Number(domainId));
    if (!record)
      throw new Error(`Transfer with txHash: ${txHash} for domain id: ${domainId} not found.`);

    return {
      status: record.status,
      explorerUrl,
    };
  }
  return data.map(record => ({
    status: record.status,
    explorerUrl,
  }));
}
