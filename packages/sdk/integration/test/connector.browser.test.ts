import { Connector } from "../../src/deprecated/connectors"
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum: any
  }
}

jest.mock('ethers', () => ({
  ...jest.requireActual("ethers"),
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn().mockReturnValue('0x00')
      })),
    }
  }
}))

describe("Connectors Browser", () => {
  global.window.ethereum = {}

  it("Should initialize Web3Provider", () => {
    const connector = Connector.initFromWeb3(global.window.ethereum)
    expect(ethers.providers.Web3Provider).toHaveBeenCalled()
    expect(ethers.providers.Web3Provider).toHaveBeenCalledWith(window.ethereum, "any")
    expect(connector.signer).toEqual('0x00')

  })
})
