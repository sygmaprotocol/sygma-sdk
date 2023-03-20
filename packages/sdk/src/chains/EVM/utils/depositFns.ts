import { ContractReceipt, providers, ethers } from 'ethers';
import {
  Bridge,
  Bridge__factory,
  ERC20,
  ERC20__factory,
  ERC721MinterBurnerPauser,
  ERC721MinterBurnerPauser__factory,
} from '@buildwithsygma/sygma-contracts';
import { DepositEvent } from '@buildwithsygma/sygma-contracts/dist/ethers/Bridge';

import { FeeDataResult } from 'types';

import {
  constructDepositDataEvmSubstrate,
  createERCDepositData,
  getTokenDecimals,
  isEIP1559MaxFeePerGas,
} from '../helpers';

import { getApproved, checkCurrentAllowanceOfErc20 } from './approvesAndChecksFns';

export type Erc20TransferParamsType = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The amount of tokens to transfer */
  amountOrId: string;
  /** The recipient's address to receive the tokens. */
  recipientAddress: string;
  /** The handler address responsible for processing the ERC20 token transfer. */
  handlerAddress: string;
  /** The ERC20 token instance used for the transfer. */
  tokenInstance: ERC20;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC20 token transfer, including the gas price and gas limit. */
  feeData: FeeDataResult;
  /** The number of confirmations required for the ERC20 token transfer. */
  confirmations: number;
  /** The provider used to interact with the blockchain network. */
  provider: providers.Provider;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};

/**
 * Perform an erc20 transfer
 *
 * @param {Erc20TransferParamsType} params - The parameters for the erc20 transfer function.
 * @returns {Promise<ContractReceipt>} - The transaction receipt.
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
  confirmations,
  overrides,
}: Erc20TransferParamsType): Promise<ContractReceipt> => {
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
    await checkCurrentAllowanceOfErc20(senderAddress, tokenInstance, handlerAddress),
  );

  // pass data to smartcontract function and create a transaction
  return executeDeposit(
    domainId,
    resourceId,
    depositData,
    feeData,
    bridgeInstance,
    confirmations,
    provider,
    overrides,
  );
};

type Erc721TransferParamsType = {
  /** The unique identifier for the destination network on the bridge. */
  domainId: string;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The tokenId for a specific ERC721 token being transferred. */
  amountOrId: string;
  /** The recipient's address to receive the token. */
  recipientAddress: string;
  /** The handler address responsible for processing the ERC721 token transfer. */
  handlerAddress: string;
  /** The ERC721 token instance used for the transfer. */
  tokenInstance: ERC721MinterBurnerPauser;
  /** The bridge instance used for the transfer. */
  bridgeInstance: Bridge;
  /** The fee data associated with the ERC721 token transfer. */
  feeData: FeeDataResult;
  /** The number of confirmations required for transaction. */
  confirmations: number;
  /** The provider used to interact with the blockchain network. */
  provider: providers.Provider;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};

/**
 * Perform an erc721 transfer
 *
 * @param {Erc721TransferParamsType} params - The parameters for ERC721 token transfer.
 * @returns {Promise<ContractReceipt>} A promise that resolves to the contract receipt.
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
  confirmations,
  overrides,
}: Erc721TransferParamsType): Promise<ContractReceipt> => {
  // construct the deposit data
  const depositData = createERCDepositData(tokenId, 20, recipientAddress);

  // Chcke approval for this particular tokenID
  console.log(
    'Approval before deposit',
    await getApproved(Number(tokenId), tokenInstance, handlerAddress),
  );

  // pass data to smartcontract function and create a transaction
  return executeDeposit(
    domainId,
    resourceId,
    depositData,
    feeData,
    bridgeInstance,
    confirmations,
    provider,
    overrides,
  );
};

/**
 * Executes a deposit operation using the specified parameters and returns a contract receipt.
 *
 * @param {string} domainId - The unique identifier for destination network.
 * @param {string} resourceId - The resource ID associated with the token.
 * @param {string} depositData - The deposit data required for the operation.
 * @param {FeeDataResult} feeData - The fee data result for the deposit operation.
 * @param {Bridge} bridgeInstance - The bridge instance used to perform the deposit operation.
 * @param {number} confirmations - The number of confirmations required before the transaction is considered successful.
 * @param {providers.Provider} provider - The provider used for the Ethereum network connection.
 * @param {ethers.PayableOverrides} [overrides] - Optional transaction overrides to be applied.
 * @returns {Promise<ContractReceipt>} A promise that resolves to a contract receipt once the deposit is executed.
 */
export const executeDeposit = async (
  domainId: string,
  resourceId: string,
  depositData: string,
  feeData: FeeDataResult,
  bridgeInstance: Bridge,
  confirmations: number,
  provider: providers.Provider,
  overrides?: ethers.PayableOverrides,
): Promise<ContractReceipt> => {
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
    const depositAction = await tx.wait(confirmations);
    return depositAction;
  } catch (error) {
    console.log('Error on executeDeposit', error);
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
 * @param {ethers.ContractReceipt} depositTx - The contract receipt containing the deposit transaction details.
 * @param {Bridge} bridgeContract - The bridge contract instance used to query the deposit event.
 * @returns {Promise<DepositEvent>} A promise that resolves to the deposit event associated with the given contract receipt.
 */

export const getDepositEventFromReceipt = async (
  depositTx: ethers.ContractReceipt,
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

export type TokenConfig = {
  /** The token type (ERC20 or ERC721) */
  type: 'erc20' | 'erc721';
  /** The address of the token contract. */
  address: string;
  /** The optional name of the token. */
  name?: string;
  /** The optional symbol of the token. */
  symbol?: string;
  /** The optional URI of the token image. */
  imageUri?: string;
  /** The resource identifier of the token. */
  resourceId: string;
  /** An optional flag indicating if the token is a native wrapped token. */
  isNativeWrappedToken?: boolean;
  /** The optional number of decimals for the token. */
  decimals?: number;
  /** An optional flag indicating if the token requires double approval (like USDT). */
  isDoubleApproval?: boolean;
  /** The fee settings for the token. */
  feeSettings: {
    /** The type of fee, either 'basic', 'feeOracle', or 'none'. */
    type: FeeType;
    /** The address of fee handler contract. */
    address: string;
  };
};
/**
 *  Fee startegies of the Bridge
 *  Where "basic" stands for fixed fee and "feeOracle" is for dynamic
 */
export type FeeType = 'basic' | 'feeOracle' | 'none';
/**
 *  The config of the bridge
 */
export type ProcessTokenTranferBridgeConfigParamsType = {
  /** The address of the bridge contract. */
  bridgeAddress: string;
  /** The address of the ERC20 handler contract. */
  erc20HandlerAddress: string;
  /** The address of the ERC721 handler contract. */
  erc721HandlerAddress: string;
  /** The domainId is an identifier of bridge in Sygma ecosystem. */
  domainId: string;
  /** An array of token configurations. */
  tokens: TokenConfig[];
  /** The optional number of confirmations */
  confirmations?: number;
};
/**
 *  The information needed for processing the token transfer deposit.
 */
export type ProcessTokenTranferDepositParamsType = {
  /** The amount of tokens to transfer or tokenId for ERC721 token, depending on the use case. */
  amountOrId: string;
  /** The unique identifier for the resource being transferred. */
  resourceId: string;
  /** The recipient's address to receive the tokens. */
  recipientAddress: string;
  /** The fee data associated with the token transfer.  */
  feeData: FeeDataResult;
};

export type ProcessTokenTranferParamsType = {
  /** The information needed for processing the token transfer deposit. */
  depositTransferInfo: ProcessTokenTranferDepositParamsType;
  /** The bridge configuration parameters for processing the token transfer. */
  bridgeConfig: ProcessTokenTranferBridgeConfigParamsType;
  /** The provider used to interact with the blockchain network. */
  provider: providers.Provider;
  /** Optional overrides for the transaction, such as gas price, gas limit, or value. */
  overrides?: ethers.PayableOverrides;
};

/**
 * Processes a token transfer to the bridge, handling both ERC20 and ERC721 tokens.
 *
 * @param {ProcessTokenTranferParamsType} params - The parameters for processing the token transfer.
 * @returns {Promise<ethers.ContractReceipt>} - A promise that resolves to the transaction receipt once the transfer is complete.
 */
export const processTokenTranfer = async ({
  depositTransferInfo,
  bridgeConfig: networkConfig,
  provider,
  overrides,
}: ProcessTokenTranferParamsType): Promise<ethers.ContractReceipt> => {
  const { tokens, bridgeAddress, domainId, confirmations: defaultConfirmations } = networkConfig;
  const { resourceId } = depositTransferInfo;

  const selectedToken = tokens.find(token => token.resourceId === resourceId);

  if (!selectedToken) {
    throw Error(`Can't find in networkConfig token with resourceID: ${resourceId}`);
  }

  const bridgeInstance = Bridge__factory.connect(bridgeAddress, provider);
  const confirmations = defaultConfirmations ?? 10;

  const commonTransferParams = {
    ...depositTransferInfo,
    domainId,
    confirmations,
    bridgeInstance,
    provider,
    overrides,
  };

  if (selectedToken.type === 'erc721') {
    const tokenInstance = ERC721MinterBurnerPauser__factory.connect(
      selectedToken.address,
      provider,
    );
    return erc721Transfer({
      ...commonTransferParams,
      handlerAddress: networkConfig.erc721HandlerAddress,
      tokenInstance,
    });
  } else {
    const tokenInstance = ERC20__factory.connect(selectedToken.address, provider);
    return erc20Transfer({
      ...commonTransferParams,
      handlerAddress: networkConfig.erc20HandlerAddress,
      tokenInstance,
    });
  }
};
