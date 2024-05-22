import { ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
export const getEvmHandlerBalance = async (destinationProviderUrl, resource, handlerAddress) => {
    const provider = new JsonRpcProvider(destinationProviderUrl);
    if (resource.native) {
        return BigInt((await provider.getBalance(handlerAddress)).toString());
    }
    else {
        const tokenAddress = resource.address;
        return await getEvmErc20Balance(handlerAddress, tokenAddress, provider);
    }
};
export const getEvmErc20Balance = async (address, tokenAddress, provider) => {
    const erc20Contract = ERC20__factory.connect(tokenAddress, provider);
    return BigInt((await erc20Contract.balanceOf(address)).toString());
};
//# sourceMappingURL=getEvmBalances.js.map