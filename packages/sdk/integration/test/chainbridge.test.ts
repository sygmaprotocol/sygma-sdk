import { Chainbridge } from '../../src'
import { BigNumber, ethers, utils } from 'ethers'
import { BridgeData } from '../../src/types'
import { ERC20Bridge } from '../../src/chains'
import { Erc20DetailedFactory } from '../../src/Contracts/Erc20DetailedFactory';

// NOTE: this setup is dependant on current chainbridge core local setup
const bridgeSetup: BridgeData = {
  chain1: {
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0x75dF75bcdCa8eA2360c562b4aaDBAF3dfAf5b19b",
    erc20HandlerAddress: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
    rpcURL: "http://localhost:8545",
    domainId: "1",
    erc20ResourceID:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    decimals: 18
  },
  chain2: {
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0x75dF75bcdCa8eA2360c562b4aaDBAF3dfAf5b19b",
    erc20HandlerAddress: "0xb83065680e6AEc805774d8545516dF4e936F0dC0",
    rpcURL: "http://localhost:8547",
    domainId: "2",
    erc20ResourceID:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    decimals: 18
  },
};

describe("chainbridge-sdk", () => {
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
  const testintAcc = '0xF4314cb9046bECe6AA54bb9533155434d0c76909'
  let chainbridge: Chainbridge

  it('Should instantiate Chainbridge class and initialize connection providing an address', () => {
    chainbridge = new Chainbridge({ bridgeSetup })
    const connectionData = chainbridge.initializeConnection(testintAcc)

    expect(Object.keys(connectionData)).toHaveLength(2)
    Object.keys(connectionData).forEach((key) => {
      const expectedKeys = ["bridgeEvents", "proposalEvents", "voteEvents"]
      // @ts-ignore-line
      expect(Object.keys(connectionData[key as keyof BridgeData])).toEqual(expectedKeys)
    })
  })

  it("Should be mintable before doing the deposit", async () => {
    const isMintable = await chainbridge.hasTokenSupplies(2, "chain2")

    expect(isMintable).toBe(true)
  })

  it("Should return false when token is not mintable", async () => {
    jest.spyOn(ERC20Bridge.prototype, "hasTokenSupplies").mockImplementation(async (...params: any) => {
      return false
    })

    const ch = new Chainbridge({ bridgeSetup })
    ch.initializeConnection(testintAcc)
    const isMintable = await ch.hasTokenSupplies(2, "chain2")

    expect(isMintable).toBe(false)
  })

  it("Should checkCurrentAllowance and it should be zero", async () => {
    const allowance = await chainbridge.checkCurrentAllowance(
      "chain1",
      testintAcc
    )

    expect(allowance).toBe(0)
  })

  it("Should check is the node is EIP1559 compatible and get gasPrice", async () => {
    const gasPrice = await chainbridge.isEIP1559MaxFeePerGas(
      "chain1"
    )

    expect(gasPrice).toBeInstanceOf(BigNumber)
  })

  it("Should get token info, balance and token name", async () => {
    const tokenInfo = await chainbridge.getTokenInfo("chain1")

    const expectedKeys = [
      "balanceOfTokens",
      "tokenName"
    ]

    expect(Object.keys(tokenInfo)).toEqual(expectedKeys)
  })

  it("Should get balance of erc20 tokens", async () => {
    const erc20ContractInstance = Erc20DetailedFactory.connect(bridgeSetup.chain1.erc20Address, provider)
    const tokenBalance = await chainbridge.getTokenBalance(erc20ContractInstance, testintAcc)

    expect(Number(utils.formatUnits(tokenBalance)) > 0).toBe(true)
  })
})
