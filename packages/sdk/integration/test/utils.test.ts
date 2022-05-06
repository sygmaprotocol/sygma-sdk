import { Bridge__factory } from '@chainsafe/chainbridge-contracts'
import { Erc20DetailedFactory } from '../../src/Contracts/Erc20DetailedFactory'
import { BridgeData, ChainbridgeContracts, Signer } from '../../src/types'
import { computeBridgeEvents, computeProposalVoteEvents, computeProvidersAndSigners } from '../../src/utils'

const bridgeSetup = {
  chain1: {
    rpcURL: "http://localhost:8545",
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0x75dF75bcdCa8eA2360c562b4aaDBAF3dfAf5b19b",
  },
  chain2: {
    rpcURL: "http://localhost:8547",
    bridgeAddress: "0xd606A00c1A39dA53EA7Bb3Ab570BBE40b156EB66",
    erc20Address: "0x75dF75bcdCa8eA2360c562b4aaDBAF3dfAf5b19b",
  }
}

const testAcc = '0xF4314cb9046bECe6AA54bb9533155434d0c76909'

describe("computeProviders function", () => {
  it("Should compute JsonRPCProvider and Signer from bridge data object", () => {
    const providersAndSigners = computeProvidersAndSigners(
      bridgeSetup as BridgeData,
      testAcc
    )

    const chain1 = providersAndSigners!['chain1' as keyof BridgeData]
    const chain2 = providersAndSigners!['chain2' as keyof BridgeData]
    const expectedKeys = ["provider", "signer"]

    expect(Object.keys(chain1)).toEqual(expectedKeys)
    expect(Object.keys(chain2)).toEqual(expectedKeys)
  })
})

describe("computeBridgeEvents function", () => {
  let contracts: ChainbridgeContracts

  beforeEach(() => {
    const providersAndSigners = computeProvidersAndSigners(
      bridgeSetup as BridgeData,
      testAcc
    )

    const signers: {
      [key: string]: { signer: Signer }
    } = Object.keys(providersAndSigners!).reduce(
      (acc, key) => ({ ...acc, [key]: providersAndSigners![key].signer }), {}
    )

    contracts = Object.keys(signers).reduce((acc, key) => {
      const bridgeContract = Bridge__factory.connect(
        bridgeSetup[key as keyof BridgeData].bridgeAddress,
        (signers! as any)[key].signer
      )

      const erc20Contract = Erc20DetailedFactory.connect(
        bridgeSetup[key as keyof BridgeData].erc20Address,
        (signers! as any)[key].signer
      )

      acc = {
        ...acc,
        [key]: { bridge: bridgeContract, bridgeEvent: {}, erc20: erc20Contract }
      }
      return acc
    }, {})

  })

  it("Should compute de Bridge events: proposal and vote events should functions", () => {
    const bridgeEvents = computeBridgeEvents(contracts)
    Object.keys(bridgeEvents).forEach((key: string) => {
      expect("proposalEvents" in bridgeEvents[key]).toBe(true)
      expect("voteEvents" in bridgeEvents[key]).toBe(true)
    })
  })
})
