import { Setup, Sygma } from '@buildwithsygma/sygma-sdk-core'
import {
  bridgeSetup,
} from './bridgeSetup'

const setupSygma = async (signerAddress: string): Promise<Sygma> => {
  const setup: Setup = { bridgeSetupList: [], bridgeSetup }
  const sygma = new Sygma(setup)
  
  const sygmaConnected = await sygma.initializeConnectionRPC(signerAddress)
  return sygmaConnected
}

export { setupSygma }