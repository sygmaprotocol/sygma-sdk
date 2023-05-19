import { BigNumber, Event } from 'ethers';
import { Bridge } from '@buildwithsygma/sygma-contracts';

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
 * Proposal execution event usually emits after funds are transferred from the bridge contract on the destination chain.
 *
 * @example
 * const depositNonce = 42 // get your depositNonce from deposit event
 * const bridgeInstance = Bridge__factory.connect(...) // your bridge contract instance from sygma-contracts
 * createProposalExecutionEventListener(
 *  depositNonce,
 *  bridgeInstance,
 *  (originDomainId, depositNonce, dataHash, tx) => {
 *    console.log(
 *      "execution events callback",
 *      originDomainId,
 *      depositNonce,
 *      dataHash,
 *      tx
 *    );
 *  }
 *);
 *
 * @category Event handling
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
 * @category Event handling
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
 * @category Event handling
 * @param {Bridge} bridge - The Bridge instance to remove the listener from.
 * @returns {Bridge} The Bridge instance with the listener removed.
 */
export const removeProposalExecutionEventListener = (bridge: Bridge): Bridge => {
  const proposalFilter = bridge.filters.ProposalExecution(null, null, null);
  return bridge.removeAllListeners(proposalFilter);
};

/**
 * Creates an event listener for deposit events on the specified Bridge contract.
 *
 * @example
 * const bridge = new Bridge(...); // Instantiate your Bridge contract instance.
 * const userAddress = "0x123...";
 *
 * function depositCallback(destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx) {
 *   console.log("Deposit event triggered:");
 *   console.log("destinationDomainId", destinationDomainId);
 *   console.log("resourceId", resourceId);
 *   console.log("depositNonce", depositNonce.toString());
 *   console.log("user", user);
 *   console.log("data", data);
 *   console.log("handleResponse", handleResponse);
 *   console.log("tx", tx);
 * }
 * const eventBridge = createDepositEventListener(bridge, userAddress, depositCallback);
 *
 * @category Event handling
 * @param {Bridge} bridge - The Bridge contract instance.
 * @param {string} userAddress - The user address to filter deposit events for.
 * @param {function} callbackFn - The callback function to be executed when a deposit event is triggered.
 * @param {number} callbackFn.destinationDomainId - The destination domainId of the deposit event.
 * @param {string} callbackFn.resourceId - The resourceId associated with the deposit event.
 * @param {BigNumber} callbackFn.depositNonce - The depositNonce of the trasfer
 * @param {string} callbackFn.user - The user address that initiated the deposit event.
 * @param {string} callbackFn.data - The data associated with the deposit event.
 * @param {string} callbackFn.handleResponse - The handle response of the deposit event.
 * @param {Event} callbackFn.tx - The transaction object containing the deposit event.
 * @returns {Bridge} - The Bridge contract instance with the event listener attached.
 */
export const createDepositEventListener = (
  bridge: Bridge,
  userAddress: string,
  callbackFn: (
    destinationDomainId: number,
    resourceId: string,
    depositNonce: BigNumber,
    user: string,
    data: string,
    handleResponse: string,
    tx: Event,
  ) => void,
): Bridge => {
  const depositFilter = bridge.filters.Deposit(null, null, null, userAddress, null, null);

  return bridge.once(
    depositFilter,
    (destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx) => {
      callbackFn(destinationDomainId, resourceId, depositNonce, user, data, handleResponse, tx);
    },
  );
};

/**
 * Removes the deposit event listener from the bridge instance.
 *
 * @category Event handling
 * @param {Bridge} bridge - a Bridge instance to remove the listener from.
 * @returns {Bridge} - bridge instance without the deposit listener.
 */
export const removeDepositEventListener = (bridge: Bridge): Bridge => {
  const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null);
  return bridge.removeAllListeners(depositFilter);
};
