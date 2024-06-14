import type { Environment } from './types.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SYGMA_ENV: Environment;
    }
  }
}
