import { Sygma } from '@buildwithsygma/sygma-sdk-core'
import {
  bridgeSetup,
  bridgeAdmin
} from './bridgeSetup'

const setupSygma = async (signerAddress: string): Promise<Sygma> => {
  const setup = { bridgeSetup }
  const sygma = new Sygma(setup)
  console.log("🚀 ~ file: sygmaInstance.ts ~ line 10 ~ setupSygma ~ sygma", sygma)
  
  const sygmaConnected = await sygma.initializeConnectionRPC(signerAddress)
  return sygmaConnected
}

export { setupSygma }