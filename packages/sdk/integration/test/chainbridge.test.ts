import { Chainbridge } from '../../src';
import { BridgeData } from '../../src/types';
import { calculateFeeData, calculateBasicfee } from '../../src/fee';

jest.mock('../../src/fee', () => ({
  calculateFeeData: jest.fn(),
  calculateBasicfee: jest.fn(),
}));

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

describe('chainbridge-sdk', () => {
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

  it('Should instantiate Chainbridge class and if feeSettings.type is "none" should trigger a console warn that no fee settings are provider', async () => {
    jest.spyOn(console, 'warn');

    const bSetup = bridgeSetup;

    bSetup.chain1.feeSettings = {
      type: 'none',
      address: '',
    };
    bSetup.chain2.feeSettings = {
      type: 'none',
      address: '',
    };

    const ch = new Chainbridge({ bridgeSetup: bSetup });
    const conn = await ch.initializeConnection(testintAcc);
    expect(console.warn).toHaveBeenCalled();
    expect(conn.chain1!.feeHandler).toBe(undefined);
    expect(conn.chain2!.feeHandler).toBe(undefined);
  });

  it('Should call fetchFeeOracleData function if type in feeSettings is feeOracle', async () => {
    (calculateFeeData as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        calculatedRate: '0.00000000000000001',
        erc20TokenAddress: '0x141F8690A87A7E57C2E270ee77Be94935970c035',
        feeData:
          '0x0000000000000000000000000000000000000000000000000001656e7165900000000000000000000000000000000000000000000000000076d6981ee7faf00000000000000000000000000000000000000000000000000000000007badfcc00000000000000000000000000000000000000000000000000000000006272f4cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000141F8690A87A7E57C2E270ee77Be94935970c035010caa866b96c1d50a53f930af80f5a6dbe7100473a39685ac04faab2c6bf4bd2f113f861c4c310cf1a3c389b84d244502d768921e39e94414877af2a56d8211ea1c0000000000000000000000000000000000000000000000000000000000000064',
      }),
    );
    const spy = jest.spyOn(Chainbridge.prototype, 'fetchFeeData');

    const bSetup = bridgeSetup;

    bSetup.chain1.feeSettings.type = 'feeOracle';
    bSetup.chain2.feeSettings.type = 'feeOracle';

    const ch = new Chainbridge({
      bridgeSetup: bSetup,
      feeOracleSetup: { feeOracleBaseUrl: 'http://locahost:8002' },
    });
    await ch.initializeConnection(testintAcc);

    await ch.fetchFeeData({
      amount: '100',
      recipientAddress: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      from: 'chain1',
      to: 'chain2',
    });

    expect(spy).toHaveBeenCalledWith({
      amount: '100',
      recipientAddress: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      from: 'chain1',
      to: 'chain2',
    });

    expect(calculateFeeData).toHaveBeenCalled()

    spy.mockRestore()
  });

  it('Should call fetchBasicFeeData function if type of feeSettings is basic', async () => {
    (calculateBasicfee as jest.Mock).mockImplementation(() => Promise.resolve('0x174876e800'))

    const spy = jest.spyOn(Chainbridge.prototype, 'fetchFeeData');

    const bSetup = bridgeSetup;

    bSetup.chain1.feeSettings.type = 'basic';
    bSetup.chain2.feeSettings.type = 'basic';

    const ch = new Chainbridge({
      bridgeSetup: bSetup,
      feeOracleSetup: { feeOracleBaseUrl: 'http://locahost:8002' },
    });

    await ch.initializeConnection(testintAcc);

    const res = await ch.fetchFeeData({
      amount: '100',
      recipientAddress: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      from: 'chain1',
      to: 'chain2',
    });


    expect(spy).toHaveBeenCalledWith({
      amount: '100',
      recipientAddress: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      from: 'chain1',
      to: 'chain2',
    });

    expect(calculateBasicfee).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('Should trigger console.warn and return void if feeSetting is none', async () => {
    const spy = jest.spyOn(console, 'warn')

    const spy2 = jest.spyOn(Chainbridge.prototype, 'fetchFeeData')


    const bSetup = bridgeSetup;

    bSetup.chain1.feeSettings.type = 'none';
    bSetup.chain2.feeSettings.type = 'none';

    const ch = new Chainbridge({
      bridgeSetup: bSetup,
      feeOracleSetup: { feeOracleBaseUrl: 'http://locahost:8002' },
    });

    await ch.initializeConnection(testintAcc);

    const res = await ch.fetchFeeData({
      amount: '100',
      recipientAddress: '0xF4314cb9046bECe6AA54bb9533155434d0c76909',
      from: 'chain1',
      to: 'chain2',
    });

    expect(spy).toHaveBeenCalledWith('No fee settings provided')
    expect(spy2).toHaveBeenCalled()
    expect(res).toBe(undefined)
  })
});
