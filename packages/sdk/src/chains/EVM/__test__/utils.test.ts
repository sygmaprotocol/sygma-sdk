import { BigNumber, ethers } from 'ethers';
import type { Bridge } from '@buildwithsygma/sygma-contracts';

import {
  createProposalExecutionEventListener,
  proposalExecutionEventListenerCount,
  removeProposalExecutionEventListener,
  connectToBridge,
} from '../utils';

describe('createProposalExecutionEventListener', () => {
  it('should create a ProposalExecution event listener', () => {
    const homeDepositNonce = 1;
    const bridge = {
      filters: { ProposalExecution: jest.fn() },
      on: jest.fn(),
    } as unknown as Bridge;

    const callbackFn = jest.fn();

    createProposalExecutionEventListener(homeDepositNonce, bridge, callbackFn);

    expect(bridge.filters.ProposalExecution.bind(this)).toHaveBeenCalledWith(null, null, null);

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
    const bridge = {
      filters: {
        ProposalExecution: jest.fn(() => 'proposalFilter'),
      },
      listenerCount: jest.fn(() => 5),
    } as unknown as Bridge;

    expect(proposalExecutionEventListenerCount(bridge)).toBe(5);
    expect(bridge.filters.ProposalExecution.bind(this)).toHaveBeenCalledWith(null, null, null);
    expect(bridge.listenerCount.bind(this)).toHaveBeenCalledWith('proposalFilter');
  });
});

describe('removeProposalExecutionEventListener', () => {
  it('should remove all listeners for a given proposal filter', () => {
    const bridge = {
      filters: {
        ProposalExecution: jest.fn().mockReturnValue('proposalFilter'),
      },
      removeAllListeners: jest.fn(),
    } as unknown as Bridge;

    removeProposalExecutionEventListener(bridge);

    expect(bridge.filters.ProposalExecution.bind(this)).toHaveBeenCalledWith(null, null, null);
    expect(bridge.removeAllListeners.bind(this)).toHaveBeenCalledWith('proposalFilter');
  });
});

describe('connectToBridge', () => {
  it('should return a Bridge instance', () => {
    const bridgeAddress = '0x1234567890123456789012345678901234567890';
    const signerOrProvider = new ethers.providers.JsonRpcProvider();

    const bridge = connectToBridge(bridgeAddress, signerOrProvider);

    expect(bridge).toEqual(
      expect.objectContaining({
        address: '0x1234567890123456789012345678901234567890',
      }),
    );
  });
});
