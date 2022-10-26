import { Sygma } from '@buildwithsygma/sygma-sdk-core'
import {
  bridgeSetup,
  bridgeAdmin
} from './bridgeSetup'

const setupSygma = async (signerAddress: string): Promise<Sygma> => {
  const setup = { bridgeSetup }
  const sygma = new Sygma(setup)
  
  const sygmaConnected = await sygma.initializeConnectionRPC(signerAddress)
  return sygmaConnected
}

export { setupSygma }