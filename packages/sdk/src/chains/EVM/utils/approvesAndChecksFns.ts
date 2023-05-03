import { BigNumber, utils, PopulatedTransaction, ethers } from 'ethers';
import { ERC20, ERC721MinterBurnerPauser } from '@buildwithsygma/sygma-contracts';

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
export const isApproved = async (
  tokenId: number,
  tokenInstance: ERC721MinterBurnerPauser,
  handlerAddress: string,
): Promise<boolean> => {
  try {
    const approvedAddress = await tokenInstance.getApproved(tokenId);
    const isApproved = approvedAddress === handlerAddress;
    return isApproved;
  } catch (error) {
    console.error('Error on isApproved', error);
    return Promise.reject(error);
  }
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
export const getERC20Allowance = async (
  senderAddress: string,
  erc20Instance: ERC20,
  erc20HandlerAddress: string,
): Promise<number> => {
  try {
    const currentAllowance = await erc20Instance.allowance(senderAddress, erc20HandlerAddress);

    return Number(utils.formatUnits(currentAllowance, 18));
  } catch (error) {
    console.error('Error on getERC20Allowance', error);
    return Promise.reject(error);
  }
};

/**
 * Creates an unsigned approval transaction for the specified amount of ERC20 tokens.
 *
 * @example
 * const unsignedTx = await approveERC20(100, erc20Instance, erc20HandlerAddress);
 * console.log('Unsigned approval transaction:', unsignedTx);
 * // You can now sign and send the transaction using the signer from ethersjs
 * const tx = await signer.sendTransaction(unsignedTx);
 * console.log('Approval transaction:', tx);
 * // You can now wait for the transaction to be mined and check the allowance again
 * const receipt = await tx.wait(1);
 * const currentAllowance = await getERC20Allowance(senderAddress, erc20Instance, erc20HandlerAddress);
 *
 * @category Token iteractions
 * @param {BigNumber} amountOrIdForApproval - The amount or tokenId to be approved.
 * @param {ERC20 | ERC721MinterBurnerPauser} tokenInstance - The ERC20 or ERC721 token instance to be approved.
 * @param {string} handlerAddress - The handler address for which the token is being approved.
 * @param {BigNumber} gasPrice - The gas price for the approval transaction.
 * @param {number} confirmations - The number of confirmations required before the transaction is considered successful.
 * @param {ethers.PayableOverrides} overrides - Optional overrides for the transaction, such as gas price, gas limit,
 * @returns {Promise<PopulatedTransaction>} A promise that resolves to a contract receipt once the approval transaction is executed.
 */
export const approve = async (
  amountOrIdForApproval: BigNumber,
  tokenInstance: ERC20 | ERC721MinterBurnerPauser,
  handlerAddress: string,
  overrides?: ethers.PayableOverrides,
): Promise<PopulatedTransaction> => {
  try {
    const unsignedTx = await tokenInstance.populateTransaction.approve(
      handlerAddress,
      amountOrIdForApproval,
      overrides,
    );
    return unsignedTx;
  } catch (error) {
    console.error('Error on approve', error);
    return Promise.reject(error);
  }
};
