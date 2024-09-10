import type { Environment } from "@buildwithsygma/core";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SYGMA_ENV: Environment;
      PRIVATE_KEY: string;
      SOURCE_EVM_RPC_URL: string;
    }
  }
}
