import { ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import type { EvmResource } from '../../types.js';

/**
 * Get liquidity of resource handler on destination domain
 * @param {string} destinationProviderUrl destination network provider URL
 * @param {EvmResource} resource sygma transferrable resource
 * @param {string} handlerAddress address of resource handler
 * @returns {Promise<bigint>} handler balance
 */
export const getEvmHandlerBalance = async (
  destinationProviderUrl: string,
  resource: EvmResource,
  handlerAddress: string,
): Promise<bigint> => {
  const provider = new JsonRpcProvider(destinationProviderUrl);
  if (resource.native) {
    return BigInt((await provider.getBalance(handlerAddress)).toString());
  } else {
    const tokenAddress = resource.address;
    return await getEvmErc20Balance(handlerAddress, tokenAddress, provider);
  }
};

/**
 * Fetch ERC20 token balance of an address
 * @param {string} address EVM address to query
 * @param {string} tokenAddress ERC20 token address
 * @param {JsonRpcProvider} provider Network provider
 * @returns {Promise<bigint>} balance
 */
export const getEvmErc20Balance = async (
  address: string,
  tokenAddress: string,
  provider: JsonRpcProvider,
): Promise<bigint> => {
  const erc20Contract = ERC20__factory.connect(tokenAddress, provider);
  return BigInt((await erc20Contract.balanceOf(address)).toString());
};
