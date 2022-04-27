import { BridgeData } from '../../src/types'
import { computeProvidersAndSigners } from '../../src/utls'

describe("computeProviders function", () => {
  const bridgeSetup = {
    chain1: {
      rpcURL: "http://localhost:8545",
    },
    chain2: {
      rpcURL: "http://localhost:8547"
    }
  }

  const testAcc = '0xF4314cb9046bECe6AA54bb9533155434d0c76909'
  it("Should computer JsonRPCProvider from bridge data object", () => {
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
