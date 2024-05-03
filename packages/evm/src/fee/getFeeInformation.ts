import type { Config, EthereumConfig, FeeHandlerType } from '@buildwithsygma/core';
import { FeeHandlerRouter__factory } from '@buildwithsygma/sygma-contracts';
import { utils, ethers } from 'ethers';

export async function getFeeInformation(
  config: Config,
  sourceProvider: ethers.providers.BaseProvider,
  sygmaSourceId: number,
  sygmaDestinationDomainId: number,
  sygmaResourceId: string,
): Promise<{
  feeHandlerAddress: string;
  feeHandlerType: FeeHandlerType;
}> {
  const domainConfig = config.getDomainConfig(sygmaSourceId) as EthereumConfig;
  const feeRouter = FeeHandlerRouter__factory.connect(domainConfig.feeRouter, sourceProvider);
  const feeHandlerAddress = await feeRouter._domainResourceIDToFeeHandlerAddress(
    sygmaDestinationDomainId,
    sygmaResourceId,
  );

  if (!utils.isAddress(feeHandlerAddress) || feeHandlerAddress === ethers.constants.AddressZero) {
    throw new Error(`Failed getting fee: route not registered on fee handler`);
  }

  const feeHandlerConfig = domainConfig.feeHandlers.find(
    feeHandler => feeHandler.address === feeHandlerAddress,
  );

  if (!feeHandlerConfig) {
    throw new Error(`Failed getting fee: fee handler not registered on environment`);
  }

  return { feeHandlerAddress: feeHandlerAddress, feeHandlerType: feeHandlerConfig?.type };
}
