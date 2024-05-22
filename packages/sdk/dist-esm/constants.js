export var ConfigUrl;
(function (ConfigUrl) {
    ConfigUrl["DEVNET"] = "https://chainbridge-assets-stage.s3.us-east-2.amazonaws.com/shared-config-dev.json";
    ConfigUrl["TESTNET"] = "https://chainbridge-assets-stage.s3.us-east-2.amazonaws.com/shared-config-test.json";
    ConfigUrl["MAINNET"] = "https://sygma-assets-mainnet.s3.us-east-2.amazonaws.com/shared-config-mainnet.json";
})(ConfigUrl || (ConfigUrl = {}));
export var IndexerUrl;
(function (IndexerUrl) {
    IndexerUrl["MAINNET"] = "https://api.buildwithsygma.com";
    IndexerUrl["TESTNET"] = "https://api.test.buildwithsygma.com";
})(IndexerUrl || (IndexerUrl = {}));
export var ExplorerUrl;
(function (ExplorerUrl) {
    ExplorerUrl["MAINNET"] = "https://scan.buildwithsygma.com";
    ExplorerUrl["TESTNET"] = "https://scan.test.buildwithsygma.com";
})(ExplorerUrl || (ExplorerUrl = {}));
//# sourceMappingURL=constants.js.map