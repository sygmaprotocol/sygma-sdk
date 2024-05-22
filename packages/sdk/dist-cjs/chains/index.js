"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Substrate = exports.EVM = void 0;
const tslib_1 = require("tslib");
/**
 *  Functions for interacting with bridge contracts on EVM chains.
 *
 */
tslib_1.__exportStar(require("./EVM/index.js"), exports);
exports.EVM = tslib_1.__importStar(require("./EVM/index.js"));
/**
 *  Functions for interacting with substrate pallet.
 *
 */
exports.Substrate = tslib_1.__importStar(require("./Substrate/index.js"));
//# sourceMappingURL=index.js.map