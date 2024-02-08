import {IndexerUrl, ExplorerUrl, EnvironmentMetadata, DomainMetadataConfig} from './constants.js';
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

/**
 * Retrieves the environment metadata
 *
 * This function accepts an environment from the `Environment` enum as its parameter and returns the corresponding environment metadata.
 * If the specified environment does not have associated metadata in `EnvironmentMetadataConfig`, the function throws an error.
 *
 * @param environment - The environment key from the `Environment` enum.
 *
 * @returns {EnvironmentMetadata} An object mapping domain IDs to {DomainMetadata}.
 *
 * @throws {Error} Throws an error if the environment does not have defined metadata.
 *
 * @example
 * try {
 *   // Get domain metadata for the MAINNET environment and fetch the URL for domain ID 2
 *   const domainID = 1;
 *   const metadata = getDomainMetadata(Environment.MAINNET);
 *   console.log(`URL for domain ID 1 in MAINNET: ${metadata[domainID].url}`);
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export function getEnvironmentMetadata(environment: Environment): EnvironmentMetadata {
  const domainMetadata = DomainMetadataConfig[environment];
  if (!domainMetadata) throw new Error('Provided environment does not have defined metadata');
  return domainMetadata;
}
