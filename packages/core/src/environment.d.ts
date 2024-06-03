import { Environment } from "./types";

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        SYGMA_ENV: Environment;
      }
    }
}
