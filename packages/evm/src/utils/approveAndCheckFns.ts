import type { ERC20, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';
import type { BigNumber, PopulatedTransaction } from 'ethers';

/**
 * Determines whether the specified token is approved for the provided handler address.
 *
 * @example
 * const tokenApproved = await isApproved(tokenInstance, handlerAddress, tokenId);
 * console.log(`Token approval status for ${tokenID}:`, isApproved);
 *
 * @category Token interactions
 * @param {ERC721MinterBurnerPauser} tokenInstance - The ERC721 token instance used to query the approval status.
 * @param {string} spender - The address for which the token approval status is checked.
 * @param {number} tokenId - The TokenId of the token to be checked.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the token is approved for the handler address.
 */
export const isApproved = async (
  tokenInstance: ERC721MinterBurnerPauser,
  spender: string,
  tokenId: number,
): Promise<boolean> => {
  const approvedAddress = await tokenInstance.getApproved(tokenId);
  const isApproved = approvedAddress === spender;
  return isApproved;
};

/**
 * Retrieves the current allowance of an ERC20 token for the specified sender and handler addresses.
 *
 * @example
 * const currentAllowance = await getERC20Allowance(erc20Instance, erc20HandlerAddress, senderAddress);
 * console.log('Current allowance:', currentAllowance);
 *
 * @category Token iteractions
 * @param {ERC20} erc20Instance - The ERC20 token instance used to query the allowance.
 * @param {string} senderAddress - The address of the token sender.
 * @param {string} spender - The address for which the token allowance is checked.
 * @returns {Promise<number>} A promise that resolves to a number representing the current allowance of the ERC20 token.
 */
export const getERC20Allowance = async (
  erc20Instance: ERC20,
  senderAddress: string,
  spender: string,
): Promise<BigNumber> => {
  return await erc20Instance.allowance(senderAddress, spender);
};

/**
 * Approves the specified token instance for a given amount or tokenId and the handler address.
 *
 * @category Token iteractions
 * @param {ERC20 | ERC721MinterBurnerPauser} tokenInstance - The ERC20 or ERC721 token instance to be approved.
 * @param {string} spender - The address for which the token is being approved.
 * @param {string} amountOrIdForApproval - The amount or tokenId to be approved.
 * @param {BigNumber} gasPrice - The gas price for the approval transaction.
 * @returns {Promise<ContractReceipt>} A promise that resolves to a contract receipt once the approval transaction is executed.
 */
export const approve = async (
  tokenInstance: ERC20 | ERC721MinterBurnerPauser,
  spender: string,
  amountOrIdForApproval: string,
): Promise<PopulatedTransaction> => {
  const unsignedTx = await tokenInstance.populateTransaction.approve(
    spender,
    amountOrIdForApproval,
  );
  return unsignedTx;
};
