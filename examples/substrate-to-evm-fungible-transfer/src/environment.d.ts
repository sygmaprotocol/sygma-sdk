import type { Environment } from "@buildwithsygma/core";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SYGMA_ENV: Environment;
    }
  }
}
