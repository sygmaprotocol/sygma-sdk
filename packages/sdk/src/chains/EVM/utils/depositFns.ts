import { BigNumber, ContractReceipt, ethers, PopulatedTransaction } from 'ethers';
import { Bridge } from '@buildwithsygma/sygma-contracts';
import { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';

import { FeeHandlerType } from '../../../types';
import { Erc20TransferParamsType, Erc721TransferParamsType, EvmFee } from '../types';
import { createERCDepositData } from '../helpers';

export const ASSET_TRANSFER_GAS_LIMIT = BigNumber.from(300000);

/**
 * Perform an erc20 transfer
 *
 * @example
 * const params = {
 *   amountOrId: '100',
 *   recipientAddress: '0x1234567890123456789012345678901234567890',
 *   tokenInstance: new ERC20(), // ERC20 instance
 *   bridgeInstance: new Bridge(), // Bridge instance from the sygma-contracts
 *   handlerAddress: '0x0987654321098765432109876543210987654321',
 *   domainId: '1',
 *   resourceId: '0x000000000000000001',
 *   feeData: { ... }, // fee data
 *   provider: new ethers.providers.Web3Provider(window.ethereum),
 *   overrides: { gasLimit: 1000000 } // optional
 * }
 * const transaction = await erc20Transfer(params)
 * // wait for the transaction to be mined
 * const receipt = await transaction.wait(3)
 * // get the deposit event
 * const depositEvent = getDepositEvent(receipt)
 *
 * @category Bridge deposit
 * @param {Erc20TransferParamsType} params - The parameters for the erc20 transfer function.
 * @returns {Promise<ContractTransaction>} - The transaction receipt.
 */
export const erc20Transfer = async ({
  amount: amount,
  recipientAddress,
  bridgeInstance,
  domainId,
  resourceId,
  feeData,
  overrides,
}: Erc20TransferParamsType): Promise<PopulatedTransaction> => {
  // construct the deposit data
  const depositData = createERCDepositData(amount, recipientAddress);

  // pass data to smartcontract function and create a transaction
  return executeDeposit(domainId, resourceId, depositData, feeData, bridgeInstance, overrides);
};

/**
 * Perform an erc721 transfer
 *
 * @example
 * const params = {
 *   domainId: '9',
 *   resourceId: '0x00001',
 *   amountOrId: '123123123', // tokenID from the ERC721
 *   recipientAddress: '0x123ABCD',
 *   handlerAddress: '0xabc123',
 *   tokenInstance: new ERC721MinterBurnerPauser(), // from the sygma-contacts
 *   bridgeInstance: new Bridge(),  // from the sygma-contacts
 *   feeData: { .. }, // fee data
 *   confirmations: 10,
 *   provider: new ethers.providers.Web3Provider(window.ethereum),
 * };
 * const receipt = await erc721Transfer(params);
 *
 * @category Bridge deposit
 * @param {Erc721TransferParamsType} params - The parameters for ERC721 token transfer.
 * @returns {Promise<ContractTransaction>} A promise that resolves to the contract receipt.
 */
export const erc721Transfer = async ({
  id: tokenId,
  recipientAddress,
  bridgeInstance,
  domainId,
  resourceId,
  feeData,
  overrides,
}: Erc721TransferParamsType): Promise<PopulatedTransaction> => {
  // construct the deposit data
  const depositData = createERCDepositData(tokenId, recipientAddress);

  // pass data to smartcontract function and create a transaction
  return executeDeposit(domainId, resourceId, depositData, feeData, bridgeInstance, overrides);
};

/**
 * Executes a deposit operation using the specified parameters and returns a contract receipt.
 *
 * @example
 * const domainId = '1';
 * const resourceId = '0x1234567890123456789012345678901234567890';
 * const depositData = '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
 * const feeData = { type: 'basic', fee: ethers.BigNumber.from('1000000000000000'), feeData: {} }; // fee data is madatory
 * const bridgeInstance = new Bridge() // Bridge instance from sygma-contracts package;
 * const confirmations = 3;
 * const provider = new ethers.providers.JsonRpcProvider();
 * const overrides = { gasLimit: 200000 };
 *
 * const transaction = executeDeposit(domainId, resourceId, depositData, feeData, bridgeInstance, confirmations, provider, overrides)
 *   .then((receipt) => console.log('Deposit executed:', receipt))
 *   .catch((error) => console.error('Error on deposit execution:', error));
 * // wait for 10 confiramtions to finalize the transaction
 * const receipt = await transaction.wait(10)
 *
 * @category Bridge deposit
 * @param {string} domainId - The unique identifier for destination network.
 * @param {string} resourceId - The resource ID associated with the token.
 * @param {string} depositData - The deposit data required for the operation.
 * @param {FeeDataResult} feeData - The fee data result for the deposit operation.
 * @param {Bridge} bridgeInstance - The bridge instance used to perform the deposit operation.
 * @param {providers.Provider} provider - The provider used for the Ethereum network connection.
 * @param {ethers.PayableOverrides} [overrides] - Optional transaction overrides to be applied.
 * @returns {Promise<ContractTransaction>} A promise that resolves to a contract receipt once the deposit is executed.
 */
export const executeDeposit = async (
  domainId: string,
  resourceId: string,
  depositData: string,
  feeData: EvmFee,
  bridgeInstance: Bridge,
  overrides?: ethers.PayableOverrides,
): Promise<PopulatedTransaction> => {
  const transactionSettings = {
    value: feeData.type === FeeHandlerType.BASIC ? feeData.fee : undefined,
    gasLimit: ASSET_TRANSFER_GAS_LIMIT,
  };

  const payableOverrides = {
    ...transactionSettings,
    ...overrides,
  };
  const tx = await bridgeInstance.populateTransaction.deposit(
    domainId,
    resourceId,
    depositData,
    feeData.feeData ? feeData.feeData : '0x0',
    payableOverrides,
  );
  return tx;
};

/**
 * Retrieves the deposit event from a given contract receipt.
 *
 * @example
 * // Assuming you have a valid contract receipt (contractReceipt) and a bridge contract instance (bridge)
 * const depositEvent = await getDepositEventFromReceipt(contractReceipt, bridge);
 * console.log('Deposit event:', depositEvent);
 * console.log('Deposit nonce:', depositEvent.args.depositNonce)
 *
 * @category Bridge deposit
 * @param {ContractReceipt} depositTx - The contract receipt containing the deposit transaction details.
 * @param {Bridge} bridgeContract - The bridge contract instance used to query the deposit event.
 * @returns {Promise<DepositEvent>} A promise that resolves to the deposit event associated with the given contract receipt.
 */
export const getDepositEventFromReceipt = async (
  depositTx: ContractReceipt,
  bridgeContract: Bridge,
): Promise<DepositEvent> => {
  try {
    const depositFilter = bridgeContract.filters.Deposit();
    const events = await bridgeContract.queryFilter(depositFilter, depositTx.blockHash);
    const event = events[0];
    return event;
  } catch (error) {
    console.error('Error on getDepositEventFromReceipt', error);
    return Promise.reject(error);
  }
};
