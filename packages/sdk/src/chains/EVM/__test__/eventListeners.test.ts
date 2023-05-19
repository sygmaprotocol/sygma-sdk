import { BigNumber } from 'ethers';
import type { Bridge } from '@buildwithsygma/sygma-contracts';

import {
  createProposalExecutionEventListener,
  proposalExecutionEventListenerCount,
  removeProposalExecutionEventListener,
  createDepositEventListener,
  removeDepositEventListener,
} from '../utils/eventListeners.js';

describe('createProposalExecutionEventListener', () => {
  it('should create a ProposalExecution event listener', () => {
    const homeDepositNonce = 1;
    const ProposalExecution = jest.fn();
    const bridge = {
      filters: { ProposalExecution },
      on: jest.fn(),
    } as unknown as Bridge;

    const callbackFn = jest.fn();

    createProposalExecutionEventListener(homeDepositNonce, bridge, callbackFn);

    expect(ProposalExecution).toHaveBeenCalledWith(null, null, null);

    // Call the event handler with some dummy data to ensure that the callback is called correctly
    const originDomainId = 3;
    const depositNonce = BigNumber.from('1');
    const dataHash = '0x12345';
    const tx = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    (bridge.on as jest.Mock).mock.calls[0][1](originDomainId, depositNonce, dataHash, tx);

    expect(callbackFn).toHaveBeenCalledWith(originDomainId, depositNonce, dataHash, tx);
  });

  it('should not call the callback if the deposit nonce does not match', () => {
    const homeDepositNonce = 1;
    const bridge = {
      filters: { ProposalExecution: jest.fn() },
      on: jest.fn(),
    } as unknown as Bridge;

    const callbackFn = jest.fn();

    createProposalExecutionEventListener(homeDepositNonce, bridge, callbackFn);

    // Call the event handler with some dummy data to ensure that the callback is not called if the nonces do not match
    const originDomainId = 3;
    const depositNonce = BigNumber.from('2'); // Nonces do not match
    const dataHash = '0x12345';
    const tx = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    (bridge.on as jest.Mock).mock.calls[0][1](originDomainId, depositNonce, dataHash, tx);

    expect(callbackFn).not.toHaveBeenCalled(); // callback should not have been called because nonces do not match
  });
});

describe('proposalExecutionEventListenerCount', () => {
  it('should return the number of listeners for the ProposalExecution event', () => {
    const ProposalExecution = jest.fn(() => 'proposalFilter');
    const listenerCount = jest.fn(() => 5);
    const bridge = {
      filters: { ProposalExecution },
      listenerCount,
    } as unknown as Bridge;

    expect(proposalExecutionEventListenerCount(bridge)).toBe(5);
    expect(ProposalExecution).toHaveBeenCalledWith(null, null, null);
    expect(listenerCount).toHaveBeenCalledWith('proposalFilter');
  });
});

describe('removeProposalExecutionEventListener', () => {
  it('should remove all listeners for a given proposal filter', () => {
    const ProposalExecution = jest.fn().mockReturnValue('proposalFilter');
    const removeAllListeners = jest.fn();
    const bridge = {
      filters: { ProposalExecution },
      removeAllListeners,
    } as unknown as Bridge;

    removeProposalExecutionEventListener(bridge);

    expect(ProposalExecution).toHaveBeenCalledWith(null, null, null);
    expect(removeAllListeners).toHaveBeenCalledWith('proposalFilter');
  });
});

describe('createDepositEventListener', () => {
  it('should call the callback function with the correct arguments', () => {
    const bridge = {
      filters: { Deposit: jest.fn() },
      once: jest
        .fn()
        .mockImplementation(
          (
            filter,
            callback: (
              destinationDomainId: number,
              resourceId: string,
              depositNonce: BigNumber,
              user: string,
              data: string,
              handleResponse: string,
              tx: string,
            ) => void,
          ) =>
            void callback(
              1,
              'mockedResourceId',
              BigNumber.from(1),
              'mockedUser',
              'mockedData',
              'mockedHandleResponse',
              'mockedTx',
            ),
        ),
    } as unknown as Bridge;
    const userAddress = '0x1234';
    const callbackFn = jest.fn();

    createDepositEventListener(bridge, userAddress, callbackFn);

    expect(callbackFn).toHaveBeenCalledWith(
      1,
      'mockedResourceId',
      BigNumber.from(1),
      'mockedUser',
      'mockedData',
      'mockedHandleResponse',
      'mockedTx',
    );
  });
});

describe('removeDepositEventListener', () => {
  it('should remove all listeners for a given proposal filter', () => {
    const Deposit = jest.fn().mockReturnValue('deposit');
    const removeAllListeners = jest.fn();
    const bridge = {
      filters: { Deposit },
      removeAllListeners,
    } as unknown as Bridge;

    removeDepositEventListener(bridge);

    expect(Deposit).toHaveBeenCalledWith(null, null, null, null, null, null);
    expect(removeAllListeners).toHaveBeenCalledWith('deposit');
  });
});
