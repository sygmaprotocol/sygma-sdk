"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvmErc20Balance = exports.getEvmHandlerBalance = void 0;
const sygma_contracts_1 = require("@buildwithsygma/sygma-contracts");
const providers_1 = require("@ethersproject/providers");
const getEvmHandlerBalance = async (destinationProviderUrl, resource, handlerAddress) => {
    const provider = new providers_1.JsonRpcProvider(destinationProviderUrl);
    if (resource.native) {
        return BigInt((await provider.getBalance(handlerAddress)).toString());
    }
    else {
        const tokenAddress = resource.address;
        return await (0, exports.getEvmErc20Balance)(handlerAddress, tokenAddress, provider);
    }
};
exports.getEvmHandlerBalance = getEvmHandlerBalance;
const getEvmErc20Balance = async (address, tokenAddress, provider) => {
    const erc20Contract = sygma_contracts_1.ERC20__factory.connect(tokenAddress, provider);
    return BigInt((await erc20Contract.balanceOf(address)).toString());
};
exports.getEvmErc20Balance = getEvmErc20Balance;
//# sourceMappingURL=getEvmBalances.js.map