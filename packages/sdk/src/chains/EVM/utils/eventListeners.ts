import { BigNumber, Event, ethers } from 'ethers';
import { Bridge, Bridge__factory } from '@buildwithsygma/sygma-contracts';

/**
 * @typedef {Object} Bridge
 */
/**
 * @typedef {Object} Event
 */
/**
 * @typedef {Object} BigNumber
 */
/**
 * Creates a ProposalExecution event listener for a given Bridge instance.
 *
 * @param {number} homeDepositNonce - The deposit nonce of the home chain.
 * @param {Bridge} bridge - The Bridge Contract instance to listen to.
 * @param {function(originDomainId: number, depositNonce: BigNumber, dataHash: string, tx: Event): void} callbackFn - Callback function to execute when a ProposalExecution event is emitted.
 * @returns {Bridge} The Bridge Contract instance with the event listener attached.
 */
export const createProposalExecutionEventListener = (
  homeDepositNonce: number,
  bridge: Bridge,
  callbackFn: (
    originDomainId: number,
    depositNonce: BigNumber,
    dataHash: string,
    tx: Event,
  ) => void,
): Bridge => {
  const proposalFilter = bridge.filters.ProposalExecution(null, null, null);

  return bridge.on(proposalFilter, (originDomainId, depositNonce, dataHash, tx) => {
    console.log('Proposal Execution event: ');
    console.group();
    console.log(originDomainId, depositNonce, homeDepositNonce);
    console.groupEnd();
    if (depositNonce.toNumber() === homeDepositNonce) {
      callbackFn(originDomainId, depositNonce, dataHash, tx);
    }
  });
};

/**
 * Returns the number of listeners for the ProposalExecution event.
 *
 * @param {Bridge} bridge The bridge to get the listener count from.
 * @returns {number} The number of listeners for the ProposalExecution event.
 */
export const proposalExecutionEventListenerCount = (bridge: Bridge): number => {
  const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
  const count = bridge.listenerCount(proposalFilter);
  return count;
};

/**
 * Removes a Proposal Execution event listener from the Bridge.
 *
 * @param {Bridge} bridge - The Bridge instance to remove the listener from.
 * @returns {Bridge} The Bridge instance with the listener removed.
 */
export const removeProposalExecutionEventListener = (bridge: Bridge): Bridge => {
  const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
  return bridge.removeAllListeners(proposalFilter);
};

/**
 * Connects to an EVM Bridge contract.
 *
 * @param {string} bridgeAddress - The address of the bridge contract.
 * @param {ethers.providers.Provider | ethers.Signer} signerOrProvider - The signer or provider to use for connecting to the bridge contract.
 * @returns {Bridge} The connected Bridge contract instance.
 */
export const connectToBridge = (
  bridgeAddress: string,
  signerOrProvider: ethers.providers.Provider | ethers.Signer,
): Bridge => {
  return Bridge__factory.connect(bridgeAddress, signerOrProvider);
};

/**
 * Creates a new JsonRpcProvider instance based on the given RPC URL
 *
 * @param {string} rpcURL - The RPC URL to use for the provider
 * @returns {ethers.providers.JsonRpcProvider} A new JsonRpcProvider instance
 */
export const getProviderByRpcUrl = (rpcURL: string): ethers.providers.JsonRpcProvider => {
  const provider = new ethers.providers.JsonRpcProvider(rpcURL);
  return provider;
};
