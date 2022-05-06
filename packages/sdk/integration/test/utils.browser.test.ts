/**
 * @jest-environment jsdom
 */
import { ethers } from 'ethers'
import { BridgeData } from '../../src/types'
import { computeProvidersAndSigners } from '../../src/utils'

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
        getSigner: jest.fn().mockReturnValue({})
      }))
    }
  }
}))

 describe("computeProviders function - Browser", () => {
   const bridgeSetup = {
     chain1: {
       rpcURL: "http://localhost:8545",
     },
     chain2: {
       rpcURL: "http://localhost:8547"
     }
   }

   it("Should compute Web3Provider and Signer if no address is passed and window.ethereum object is defined", () => {
     global.window.ethereum = {}
     const providersAndSigners = computeProvidersAndSigners(bridgeSetup as BridgeData)
     const expectedSubkeys = ["provider", "signer"]
     expect("chain1" in providersAndSigners!).toBe(true)
     expect("chain2" in providersAndSigners!).toBe(true)
     Object.keys(providersAndSigners!).forEach(key => {
       expect(Object.keys(providersAndSigners![key as keyof BridgeData])).toEqual(expectedSubkeys)
     })
     expect(ethers.providers.Web3Provider).toHaveBeenCalledTimes(2)
   })
 })
