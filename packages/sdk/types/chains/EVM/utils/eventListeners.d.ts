import type { BigNumber, Event } from 'ethers';
import type { Bridge } from '@buildwithsygma/sygma-contracts';
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
export declare const createProposalExecutionEventListener: (homeDepositNonce: number, bridge: Bridge, callbackFn: (originDomainId: number, depositNonce: BigNumber, dataHash: string, tx: string) => void) => Bridge;
/**
 * Returns the number of listeners for the ProposalExecution event.
 *
 * @category Event handling
 * @param {Bridge} bridge The bridge to get the listener count from.
 * @returns {number} The number of listeners for the ProposalExecution event.
 */
export declare const proposalExecutionEventListenerCount: (bridge: Bridge) => number;
/**
 * Removes a Proposal Execution event listener from the Bridge.
 *
 * @category Event handling
 * @param {Bridge} bridge - The Bridge instance to remove the listener from.
 * @returns {Bridge} The Bridge instance with the listener removed.
 */
export declare const removeProposalExecutionEventListener: (bridge: Bridge) => Bridge;
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
export declare const createDepositEventListener: (bridge: Bridge, userAddress: string, callbackFn: (destinationDomainId: number, resourceId: string, depositNonce: BigNumber, user: string, data: string, handleResponse: string, tx: Event) => void) => Bridge;
/**
 * Removes the deposit event listener from the bridge instance.
 *
 * @category Event handling
 * @param {Bridge} bridge - a Bridge instance to remove the listener from.
 * @returns {Bridge} - bridge instance without the deposit listener.
 */
export declare const removeDepositEventListener: (bridge: Bridge) => Bridge;
//# sourceMappingURL=eventListeners.d.ts.map