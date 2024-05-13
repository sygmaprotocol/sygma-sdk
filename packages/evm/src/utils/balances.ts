import { ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import type { EvmResource } from '@buildwithsygma/core';
import type { Eip1193Provider } from '../types.js';

/**
 * Get liquidity of resource handler on destination domain
 * @param {string} destinationProviderUrl destination network provider URL
 * @param {EvmResource} resource sygma transferrable resource
 * @param {string} handlerAddress address of resource handler
 * @returns {Promise<bigint>} handler balance
 */
export const getEvmHandlerBalance = async (
  provider: Eip1193Provider,
  resource: EvmResource,
  handlerAddress: string,
): Promise<bigint> => {
  const web3Provider = new Web3Provider(provider);
  if (resource.native) {
    return (await web3Provider.getBalance(handlerAddress)).toBigInt();
  } else {
    const tokenAddress = resource.address;
    return await getEvmErc20Balance(provider, tokenAddress, handlerAddress);
  }
};

/**
 * Fetch ERC20 token balance of an address
 * @param {JsonRpcProvider} provider Network provider
 * @param {string} tokenAddress ERC20 token address
 * @param {string} address EVM address to query
 * @returns {Promise<bigint>} balance
 */
export const getEvmErc20Balance = async (
  provider: Eip1193Provider,
  tokenAddress: string,
  address: string,
): Promise<bigint> => {
  const web3Provider = new Web3Provider(provider);
  const erc20Contract = ERC20__factory.connect(tokenAddress, web3Provider);
  return BigInt((await erc20Contract.balanceOf(address)).toString());
};
