import type { Config, EthereumConfig, FeeHandlerType } from '@buildwithsygma/core';
import {
  BasicFeeHandler__factory,
  Bridge__factory,
  FeeHandlerRouter__factory,
} from '@buildwithsygma/sygma-contracts';
import { utils, ethers } from 'ethers';
/**
 * @category EvmFee
 * Retrieves fee information
 * configured on chain for a specific
 * route
 * @param {Config} config
 * @param {ethers.providers.BaseProvider} sourceProvider 
 * @param {number} sygmaSourceId 
 * @param {number} sygmaDestinationDomainId 
 * @param {string} sygmaResourceId 
 * @returns {Promise<{feeHandlerAddress: string; feeHandlerType: FeeHandlerType;}>}
 * @internal
 */
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
  const domainConfig = config.findDomainConfigBySygmaId(sygmaSourceId) as EthereumConfig;
  const bridgeInstance = Bridge__factory.connect(domainConfig.bridge, sourceProvider);
  const feeRouterAddress = await bridgeInstance._feeHandler();

  const feeRouter = FeeHandlerRouter__factory.connect(feeRouterAddress, sourceProvider);
  const feeHandlerAddress = await feeRouter._domainResourceIDToFeeHandlerAddress(
    sygmaDestinationDomainId,
    sygmaResourceId,
  );

  if (!utils.isAddress(feeHandlerAddress) || feeHandlerAddress === ethers.constants.AddressZero) {
    throw new Error(`Failed getting fee: route not registered on fee handler`);
  }

  const FeeHandler = BasicFeeHandler__factory.connect(feeHandlerAddress, sourceProvider);

  const feeHandlerType = (await FeeHandler.feeHandlerType()) as unknown as FeeHandlerType;

  return { feeHandlerAddress, feeHandlerType };
}
