import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@buildwithsygma/sygma-sdk-core"],
  },
  build: {
    commonjsOptions: {
      include: [/@buildwithsygma\/sygma-sdk-core/, /node_modules/],
    },
  },
  define: {
    global: {},
  },
  resolve: {
    alias: {
      process: "process/browser",
      buffer: "buffer",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      assert: "assert",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify",
      url: "url",
      util: "util/",
    },
  },
});
