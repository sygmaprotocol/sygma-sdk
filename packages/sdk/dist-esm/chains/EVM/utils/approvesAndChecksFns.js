/**
 * Determines whether the specified token is approved for the provided handler address.
 *
 * @example
 * // Assuming you have a valid tokenId, an ERC721 token instance (tokenInstance), and a handler address (handlerAddress)
 * const tokenApproved = await isApproved(tokenId, tokenInstance, handlerAddress);
 * console.log(`Token approval status for ${tokenID}:`, isApproved);
 *
 * @category Token iteractions
 * @param {number} tokenId - The TokenId of the token to be checked.
 * @param {ERC721MinterBurnerPauser} tokenInstance - The ERC721 token instance used to query the approval status.
 * @param {string} handlerAddress - The handler address for which the token approval status is checked.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the token is approved for the handler address.
 */
export const isApproved = async (tokenId, tokenInstance, handlerAddress) => {
    const approvedAddress = await tokenInstance.getApproved(tokenId);
    const isApproved = approvedAddress === handlerAddress;
    return isApproved;
};
/**
 * Retrieves the current allowance of an ERC20 token for the specified sender and handler addresses.
 *
 * @example
 * // Assuming you have a valid sender address, an ERC20 token instance (erc20Instance), and a handler address (erc20HandlerAddress)
 * const currentAllowance = await getERC20Allowance(senderAddress, erc20Instance, erc20HandlerAddress);
 * console.log('Current allowance:', currentAllowance);
 *
 * @category Token iteractions
 * @param {string} senderAddress - The address of the token sender.
 * @param {ERC20} erc20Instance - The ERC20 token instance used to query the allowance.
 * @param {string} erc20HandlerAddress - The handler address for which the token allowance is checked.
 * @returns {Promise<number>} A promise that resolves to a number representing the current allowance of the ERC20 token.
 */
export const getERC20Allowance = async (senderAddress, erc20Instance, erc20HandlerAddress) => {
    return await erc20Instance.allowance(senderAddress, erc20HandlerAddress);
};
/**
 * Approves the specified token instance for a given amount or tokenId and the handler address.
 *
 * @category Token iteractions
 * @param {string} amountOrIdForApproval - The amount or tokenId to be approved.
 * @param {ERC20 | ERC721MinterBurnerPauser} tokenInstance - The ERC20 or ERC721 token instance to be approved.
 * @param {string} handlerAddress - The handler address for which the token is being approved.
 * @param {BigNumber} gasPrice - The gas price for the approval transaction.
 * @returns {Promise<ContractReceipt>} A promise that resolves to a contract receipt once the approval transaction is executed.
 */
export const approve = async (amountOrIdForApproval, tokenInstance, handlerAddress) => {
    const unsignedTx = await tokenInstance.populateTransaction.approve(handlerAddress, amountOrIdForApproval);
    return unsignedTx;
};
//# sourceMappingURL=approvesAndChecksFns.js.map