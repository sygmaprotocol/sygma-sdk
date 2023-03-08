import { Setup, Sygma } from "@buildwithsygma/sygma-sdk-core";
import { bridgeSetup } from "./bridgeSetup";

const setupSygma = (signerAddress: string): Sygma => {
  const setup: Setup = { bridgeSetupList: [], bridgeSetup };
  const sygma = new Sygma(setup);

  const sygmaConnected = sygma.initializeConnectionRPC(signerAddress);
  return sygmaConnected;
};

export { setupSygma };
