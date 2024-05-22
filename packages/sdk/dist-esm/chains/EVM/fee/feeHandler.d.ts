import type { ethers } from 'ethers';
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
export declare const getFeeHandlerAddress: (signerOrProvider: ethers.providers.BaseProvider, feeRouterAddress: string, domainId: string, resourceId: string) => Promise<string>;
//# sourceMappingURL=feeHandler.d.ts.map