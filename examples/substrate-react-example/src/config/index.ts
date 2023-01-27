export type SubstrateConfigType = {
  APP_NAME: string;
  CUSTOM_RPC_METHODS: {};
  PROVIDER_SOCKET: string;
};
const config: SubstrateConfigType = {
  APP_NAME: "substrate-front-end-template",
  CUSTOM_RPC_METHODS: {},
  PROVIDER_SOCKET: "ws://127.0.0.1:9944",
};
export default config;
