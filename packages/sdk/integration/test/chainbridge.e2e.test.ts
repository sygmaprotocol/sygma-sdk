/* eslint-disable */

import { ContractReceipt, utils, BigNumber, ethers } from 'ethers';
import { ERC20Bridge } from '../../src/chains';
import { Erc20DetailedFactory } from '../../src/Contracts/Erc20DetailedFactory';
import { BridgeData, Chainbridge } from '../../src';

// NOTE: this setup is dependant on current chainbridge core local setup
const bridgeSetup: BridgeData = {
  chain1: {
    bridgeAddress: '0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66',
    erc20Address: '0xb83065680e6AEc805774d8545516dF4e936F0dC0',
    erc20HandlerAddress: '0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e',
    rpcURL: 'http://localhost:8545',
    domainId: '1',
    erc20ResourceID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    decimals: 18,
    feeSettings: {
      type: 'basic',
      address: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69',
    },
  },
  chain2: {
    bridgeAddress: '0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66',
    erc20Address: '0xb83065680e6AEc805774d8545516dF4e936F0dC0',
    erc20HandlerAddress: '0x3cA3808176Ad060Ad80c4e08F30d85973Ef1d99e',
    rpcURL: 'http://localhost:8547',
    domainId: '2',
    erc20ResourceID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    decimals: 18,
    feeSettings: {
      type: 'basic',
      address: '0x08CFcF164dc2C4AB1E0966F236E87F913DE77b69',
    },
  },
};

describe('Chainbridge e2e deposit event', () => {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const testintAcc = '0xF4314cb9046bECe6AA54bb9533155434d0c76909';
  let chainbridge: Chainbridge;

  it('Should instantiate Chainbridge class and initialize connection providing an address', async () => {
    chainbridge = new Chainbridge({ bridgeSetup });
    const connectionData = await chainbridge.initializeConnection(testintAcc);

    expect(Object.keys(connectionData)).toHaveLength(2);
    Object.keys(connectionData).forEach(key => {
      const expectedKeys = ['bridgeEvents', 'proposalEvents', 'voteEvents', 'feeHandler'];
      // @ts-ignore-line
      expect(Object.keys(connectionData[key as keyof BridgeData])).toEqual(expectedKeys);
    });
  });

  it('Should be mintable before doing the deposit', async () => {
    const isMintable = await chainbridge.hasTokenSupplies(2, 'chain2');

    expect(isMintable).toBe(true);
  });

  it('Should return false when token is not mintable', async () => {
    jest
      .spyOn(ERC20Bridge.prototype, 'hasTokenSupplies')
      .mockImplementation(async (...params: any) => {
        return false;
      });

    const ch = new Chainbridge({ bridgeSetup });
    ch.initializeConnection(testintAcc);
    const isMintable = await ch.hasTokenSupplies(2, 'chain2');

    expect(isMintable).toBe(false);
  });

  it('Should checkCurrentAllowance and it should be zero', async () => {
    const allowance = await chainbridge.checkCurrentAllowance('chain1', testintAcc);

    expect(allowance).toBe(0);
  });

  it('Should check is the node is EIP1559 compatible and get gasPrice', async () => {
    const gasPrice = await chainbridge.isEIP1559MaxFeePerGas('chain1');

    expect(gasPrice).toBeInstanceOf(BigNumber);
  });

  it('Should get token info, balance and token name', async () => {
    const tokenInfo = await chainbridge.getTokenInfo('chain1');

    const expectedKeys = ['balanceOfTokens', 'tokenName'];

    expect(Object.keys(tokenInfo)).toEqual(expectedKeys);
  });

  it('Should get balance of erc20 tokens', async () => {
    const erc20ContractInstance = Erc20DetailedFactory.connect(
      bridgeSetup.chain1.erc20Address,
      provider,
    );
    const tokenBalance = await chainbridge.getTokenBalance(erc20ContractInstance, testintAcc);

    expect(Number(utils.formatUnits(tokenBalance)) > 0).toBe(true);
  });

  it('Should transfer some tokens from chain1 to chain2', async () => {
    const amount = 7;
    const recipientAddress = testintAcc;
    const from = 'chain1';
    const to = 'chain2';

    const depositAction = await chainbridge.deposit(amount, recipientAddress, from, to);

    console.log('depositAction', depositAction);
    const { status } = depositAction as ContractReceipt;
    expect(status).toBe(1);
  });
});
