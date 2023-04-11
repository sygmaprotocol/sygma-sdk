import { ContractTransaction, ContractReceipt, providers, ethers } from 'ethers';
import {
  Bridge,
  Bridge__factory,
  ERC20__factory,
  ERC721MinterBurnerPauser__factory,
} from '@buildwithsygma/sygma-contracts';
import { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';

import { FeeDataResult } from 'types';
import { Erc20TransferParamsType, Erc721TransferParamsType, TokenTransfer } from '../types';

import {
  constructDepositDataEvmSubstrate,
  createERCDepositData,
  getTokenDecimals,
  isEIP1559MaxFeePerGas,
} from '../helpers';

import { isApproved, getERC20Allowance } from './approvesAndChecksFns';

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
 *   confirmations: 6,
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
  amountOrId: amount,
  recipientAddress,
  tokenInstance,
  bridgeInstance,
  provider,
  handlerAddress,
  domainId,
  resourceId,
  feeData,
  overrides,
}: Erc20TransferParamsType): Promise<ContractTransaction> => {
  // construct the deposit data
  const depositData = constructDepositDataEvmSubstrate(
    amount,
    recipientAddress,
    await getTokenDecimals(tokenInstance),
  );

  // Perform checks before deposit
  const senderAddress = await bridgeInstance.signer.getAddress();
  console.log(
    'allowance before deposit',
    await getERC20Allowance(senderAddress, tokenInstance, handlerAddress),
  );

  // pass data to smartcontract function and create a transaction
  return executeDeposit(
    domainId,
    resourceId,
    depositData,
    feeData,
    bridgeInstance,
    provider,
    overrides,
  );
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
  amountOrId: tokenId,
  recipientAddress,
  tokenInstance,
  bridgeInstance,
  provider,
  handlerAddress,
  domainId,
  resourceId,
  feeData,
  overrides,
}: Erc721TransferParamsType): Promise<ContractTransaction> => {
  // construct the deposit data
  const depositData = createERCDepositData(tokenId, 20, recipientAddress);

  // Chcke approval for this particular tokenID
  console.log(
    'Approval before deposit',
    await isApproved(Number(tokenId), tokenInstance, handlerAddress),
  );

  // pass data to smartcontract function and create a transaction
  return executeDeposit(
    domainId,
    resourceId,
    depositData,
    feeData,
    bridgeInstance,
    provider,
    overrides,
  );
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
  feeData: FeeDataResult,
  bridgeInstance: Bridge,
  provider: providers.Provider,
  overrides?: ethers.PayableOverrides,
): Promise<ContractTransaction> => {
  try {
    const gasPrice = await isEIP1559MaxFeePerGas(provider);
    const gasPriceStringify = typeof gasPrice !== 'boolean' ? gasPrice.toString() : undefined;

    const payableOverrides = {
      gasPrice: gasPriceStringify,
      value: feeData.type === 'basic' ? feeData.fee : undefined,
      ...overrides,
    };
    const tx = await bridgeInstance.deposit(
      domainId,
      resourceId,
      depositData,
      feeData.feeData,
      payableOverrides,
    );
    return tx;
  } catch (error) {
    console.error('Error on executeDeposit', error);
    return Promise.reject(error);
  }
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

/**
 * Processes a token transfer to the bridge on top level of abstracttion, handling both ERC20 and ERC721 tokens.
 *
 * @example
 * // this short example could miss some params, please look at types for correct info
 * const depositParams = { resourceId: '0x123', amountOrId: "100", recepientAddress: "0x0123", feeData: "// fee data ///" };
 * const bridgeConfig = { tokens: [{ resourceId: '0x123', address: '0x456', type: 'erc20' }], bridgeAddress: '0x789', domainId: 1 };
 * const provider = new ethers.providers.Web3Provider(window.ethereum);
 * // any ovveride settting for etherjs tranasaction
 * const overrides = { gasLimit: 100000 };
 * const receipt = await processTokenTranfer({ depositParams, bridgeConfig, provider, overrides });
 * // use the getDepositEventFromReceipt method to get the depositNonce
 *
 * @category Bridge deposit
 * @param {TokenTransfer} params - The parameters for processing the token transfer.
 * @returns {Promise<ContractTransaction>} - A promise that resolves to the transaction receipt once the transfer is complete.
 */
export const processTokenTranfer = async ({
  depositParams,
  bridgeConfig,
  provider,
  overrides,
}: TokenTransfer): Promise<ContractTransaction> => {
  const { tokens, bridgeAddress, domainId, confirmations: defaultConfirmations } = bridgeConfig;
  const { resourceId } = depositParams;

  const selectedToken = tokens.find(token => token.resourceId === resourceId);

  if (!selectedToken) {
    throw Error(`Can't find in networkConfig token with resourceID: ${resourceId}`);
  }

  const bridgeInstance = Bridge__factory.connect(bridgeAddress, provider);
  const confirmations = defaultConfirmations ?? 10;

  const commonTransferParams = {
    ...depositParams,
    domainId,
    confirmations,
    bridgeInstance,
    provider,
    overrides,
  };

  const tokenTypeHandlers = {
    erc721: async () => {
      const tokenInstance = ERC721MinterBurnerPauser__factory.connect(
        selectedToken.address,
        provider,
      );
      return erc721Transfer({
        ...commonTransferParams,
        handlerAddress: bridgeConfig.erc721HandlerAddress,
        tokenInstance,
      });
    },
    erc20: async () => {
      const tokenInstance = ERC20__factory.connect(selectedToken.address, provider);
      return erc20Transfer({
        ...commonTransferParams,
        handlerAddress: bridgeConfig.erc20HandlerAddress,
        tokenInstance,
      });
    },
  };

  const handleTokenTransfer = tokenTypeHandlers[selectedToken.type];

  if (!handleTokenTransfer) {
    throw Error(`Unsupported token type: ${selectedToken.type}`);
  }

  return handleTokenTransfer();
};
