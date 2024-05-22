"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBasicfee = void 0;
const sygma_contracts_1 = require("@buildwithsygma/sygma-contracts");
const ethers_1 = require("ethers");
const index_js_1 = require("../../../types/index.js");
/**
 * Calculates and returns the fee in native currency.
 *
 * @example
 * import { ethers } from 'ethers';
 * import { calculateBasicfee } from '@buildwithsygma/sygma-sdk/EVM';
 * // also you can use valid alchemy API KEY
 * const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');
 * const basicFeeData = await calculateBasicfee({
 *   basicFeeHandlerAddress: '0x1234...',
 *   provider: new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID'),
 *   sender: '0x5678...',
 *   fromDomainID: 1,
 *   toDomainID: 2,
 *   resourceID: '0x00000...0001',
 * });
 * console.log(basicFeeData);
 * // {
 * //   type: 'basic',
 * //   fee: BigNumber { _hex: '0x0' },
 * //   calculatedRate: '0',
 * //   erc20TokenAddress: '0x00000000ABCD0000000000000000000000000000',
 * //   feeData: '0x0000000...HEX'
 * // }
 *
 * @category Fee
 * @param {Object} - Object to get the fee data
 * @returns {Promise<FeeDataResult>}
 */
const calculateBasicfee = async ({ basicFeeHandlerAddress, provider, sender, fromDomainID, toDomainID, resourceID, }) => {
    const BasicFeeHandlerInstance = sygma_contracts_1.BasicFeeHandler__factory.connect(basicFeeHandlerAddress, provider);
    const calculatedFee = await BasicFeeHandlerInstance.calculateFee(sender, fromDomainID, toDomainID, resourceID, ethers_1.utils.formatBytes32String(''), ethers_1.utils.formatBytes32String(''));
    const [fee] = calculatedFee;
    return {
        fee,
        feeData: fee.toHexString(),
        type: index_js_1.FeeHandlerType.BASIC,
        handlerAddress: basicFeeHandlerAddress,
    };
};
exports.calculateBasicfee = calculateBasicfee;
//# sourceMappingURL=basicFee.js.map