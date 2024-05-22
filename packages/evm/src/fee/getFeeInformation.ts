import type { Config, EthereumConfig, FeeHandlerType } from '@buildwithsygma/core';
import { BasicFeeHandler__factory, FeeHandlerRouter__factory } from '@buildwithsygma/sygma-contracts';
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
  const domainConfig = config.getDomainConfig({ sygmaId: Number(sygmaSourceId) }) as EthereumConfig;
  const feeRouter = FeeHandlerRouter__factory.connect(domainConfig.feeRouter, sourceProvider);
  const feeHandlerAddress = await feeRouter._domainResourceIDToFeeHandlerAddress(
    sygmaDestinationDomainId,
    sygmaResourceId,
  );

  if (!utils.isAddress(feeHandlerAddress) || feeHandlerAddress === ethers.constants.AddressZero) {
    throw new Error(`Failed getting fee: route not registered on fee handler`);
  }

  const FeeHandler = BasicFeeHandler__factory.connect(
    feeHandlerAddress,
    sourceProvider
  )

  const feeHandlerType = await FeeHandler.feeHandlerType() as unknown as FeeHandlerType;

  return { feeHandlerAddress, feeHandlerType };
}
