import type { ethers } from 'ethers';
import type { EvmFee } from '../types/index.js';
/**
 * Calculates and returns the fee in native currency.
 *
 * @category Fee
 * @param {Object} - Object to get the fee data
 * @returns {Promise<FeeDataResult>}
 */
export declare const getPercentageFee: ({ precentageFeeHandlerAddress, provider, sender, fromDomainID, toDomainID, resourceID, depositData, }: {
    precentageFeeHandlerAddress: string;
    provider: ethers.providers.Provider;
    sender: string;
    fromDomainID: number;
    toDomainID: number;
    resourceID: string;
    depositData: string;
}) => Promise<EvmFee>;
//# sourceMappingURL=percentageFee.d.ts.map