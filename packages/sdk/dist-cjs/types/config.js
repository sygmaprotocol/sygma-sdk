"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = exports.Environment = void 0;
var Environment;
(function (Environment) {
    Environment["LOCAL"] = "local";
    Environment["DEVNET"] = "devnet";
    Environment["TESTNET"] = "testnet";
    Environment["MAINNET"] = "mainnet";
})(Environment || (exports.Environment = Environment = {}));
var Network;
(function (Network) {
    Network["EVM"] = "evm";
    Network["SUBSTRATE"] = "substrate";
})(Network || (exports.Network = Network = {}));
//# sourceMappingURL=config.js.map