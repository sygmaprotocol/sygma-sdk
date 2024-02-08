import { IndexerUrl, ExplorerUrl } from './constants.js';
import type { TransferStatus, TransferStatusResponse } from './types/index.js';
import { Environment } from './types/index.js';

/**
 * @@description Get the status of a transfer using transaction hash and optionally domain id
 */
export async function getTransferStatusData(
  environment: Environment,
  txHash: string,
  domainId?: string,
): Promise<TransferStatusResponse> {
  let url: string;
  let explorerUrl: string;

  if (environment === Environment.TESTNET) {
    url = `${IndexerUrl.TESTNET}/api/transfers/txHash/${txHash}${
      domainId ? `?domainId=${domainId}` : ''
    }`;
    explorerUrl = `${ExplorerUrl.TESTNET}/transfer/${txHash}`;
  } else if (environment === Environment.MAINNET) {
    url = `${IndexerUrl.MAINNET}/api/transfers/txHash/${txHash}${
      domainId ? `?domainId=${domainId}` : ''
    }`;
    explorerUrl = `${ExplorerUrl.MAINNET}/transfer/${txHash}`;
  } else {
    throw new Error('Invalid environment');
  }

  const response = await fetch(url);
  const data = (await response.json()) as Record<string, unknown> & { status: TransferStatus };
  return {
    status: data.status,
    explorerUrl,
  };
}
