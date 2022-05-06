/**
 * @jest-environment jsdom
 */

import { Connector } from "../../src/connectors"
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
        getSigner: jest.fn()
      }))
    }
  }
}))

describe("Connectors Browser", () => {
  global.window.ethereum = {}

  it("Should initialize Web3Provider", () => {
    Connector.getInstance()
    expect(ethers.providers.Web3Provider).toHaveBeenCalled()
    expect(ethers.providers.Web3Provider).toHaveBeenCalledWith(window.ethereum, "any")
  })
  it("Should setup provider as undefined and get a warn message if no param is passed", () => {
    delete global.window.ethereum
    jest.spyOn(console, "warn")
    Connector.getInstance()
    expect(console.warn).toHaveBeenCalled()
  })
})
