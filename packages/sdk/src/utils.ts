import { IndexerUrl } from './constants';
import { Environment, TransferStatus } from './types';

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
export async function getTransferStatus(
  environment: Environment,
  txHash: string,
  domainId?: string,
): Promise<TransferStatus> {
  let url: string;

  if (environment === Environment.TESTNET) {
    url = IndexerUrl.TESTNET;
  } else if (environment === Environment.MAINNET) {
    url = IndexerUrl.MAINNET;
  } else {
    throw new Error('Invalid environment');
  }

  const response = await fetch(
    `${url}/api/transfers/txHash/${txHash}?${domainId ? `domainId=${domainId}` : ''}}`,
  );
  const data = (await response.json()) as Record<string, unknown> & { status: TransferStatus };
  return data.status;
}
