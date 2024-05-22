"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeeHandlerAddress = void 0;
const sygma_contracts_1 = require("@buildwithsygma/sygma-contracts");
/**
 * Retrieves the fee handler address for the given domain ID and resource ID from the FeeHandlerRouter contract.
 *
 * @example
 * const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
 * const feeRouterAddress = '0x1234...';
 * const domainId = '1';
 * const resourceId = '0x123ABCD...';
 *
 * getFeeHandlerAddress(provider, feeRouterAddress, domainId, resourceId)
 *   .then(feeHandlerAddress => {
 *     console.log('Fee Handler Address:', feeHandlerAddress);
 *   })
 *   .catch(error => {
 *     console.error('Error:', error);
 *   });
 *
 * @category Fee
 * @param {ethers.providers.JsonRpcProvider | ethers.Signer} signerOrProvider - The JSON RPC provider or signer object.
 * @param {string} feeRouterAddress - The address of the FeeHandlerRouter contract.
 * @param {string} domainId - The domain ID for which the fee handler address is to be fetched.
 * @param {string} resourceId - The resource ID for which the fee handler address is to be fetched.
 * @returns {Promise<string>} A promise that resolves to the fee handler address.
 */
const getFeeHandlerAddress = async (signerOrProvider, feeRouterAddress, domainId, resourceId) => {
    const feeHandlerContract = sygma_contracts_1.FeeHandlerRouter__factory.connect(feeRouterAddress, signerOrProvider);
    let feeHandlerAddress;
    try {
        feeHandlerAddress = await feeHandlerContract._domainResourceIDToFeeHandlerAddress(domainId, resourceId);
        return feeHandlerAddress;
    }
    catch (error) {
        console.warn('Error fetching fee handler address', error);
        return Promise.reject(error);
    }
};
exports.getFeeHandlerAddress = getFeeHandlerAddress;
//# sourceMappingURL=feeHandler.js.map