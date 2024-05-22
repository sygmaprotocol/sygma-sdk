"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPercentageFee = void 0;
const sygma_contracts_1 = require("@buildwithsygma/sygma-contracts");
const ethers_1 = require("ethers");
const index_js_1 = require("../../../types/index.js");
/**
 * Calculates and returns the fee in native currency.
 *
 * @category Fee
 * @param {Object} - Object to get the fee data
 * @returns {Promise<FeeDataResult>}
 */
const getPercentageFee = async ({ precentageFeeHandlerAddress, provider, sender, fromDomainID, toDomainID, resourceID, depositData, }) => {
    const percentageFeeHandlerContract = sygma_contracts_1.PercentageERC20FeeHandlerEVM__factory.connect(precentageFeeHandlerAddress, provider);
    const calculatedFee = await percentageFeeHandlerContract.calculateFee(sender, fromDomainID, toDomainID, resourceID, depositData, ethers_1.utils.formatBytes32String(''));
    const [fee] = calculatedFee;
    return {
        fee,
        feeData: fee.toHexString(),
        type: index_js_1.FeeHandlerType.PERCENTAGE,
        handlerAddress: precentageFeeHandlerAddress,
    };
};
exports.getPercentageFee = getPercentageFee;
//# sourceMappingURL=percentageFee.js.map