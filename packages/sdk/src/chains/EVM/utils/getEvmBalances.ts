import { ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { EvmResource } from 'types';

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
    return await getEvmErcBalance(handlerAddress, tokenAddress, provider);
  }
};

export const getEvmErcBalance = async (
  address: string,
  tokenAddress: string,
  provider: JsonRpcProvider,
): Promise<bigint> => {
  const erc20Contract = ERC20__factory.connect(tokenAddress, provider);
  return BigInt((await erc20Contract.balanceOf(address)).toString());
};
