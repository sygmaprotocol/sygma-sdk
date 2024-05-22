"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvmErc20Balance = exports.erc721Transfer = exports.erc20Transfer = exports.approve = exports.getERC20Allowance = exports.isApproved = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./eventListeners.js"), exports);
tslib_1.__exportStar(require("./approvesAndChecksFns.js"), exports);
tslib_1.__exportStar(require("./depositFns.js"), exports);
tslib_1.__exportStar(require("./eventListeners.js"), exports);
var approvesAndChecksFns_js_1 = require("./approvesAndChecksFns.js");
Object.defineProperty(exports, "isApproved", { enumerable: true, get: function () { return approvesAndChecksFns_js_1.isApproved; } });
Object.defineProperty(exports, "getERC20Allowance", { enumerable: true, get: function () { return approvesAndChecksFns_js_1.getERC20Allowance; } });
Object.defineProperty(exports, "approve", { enumerable: true, get: function () { return approvesAndChecksFns_js_1.approve; } });
var depositFns_js_1 = require("./depositFns.js");
Object.defineProperty(exports, "erc20Transfer", { enumerable: true, get: function () { return depositFns_js_1.erc20Transfer; } });
Object.defineProperty(exports, "erc721Transfer", { enumerable: true, get: function () { return depositFns_js_1.erc721Transfer; } });
var getEvmBalances_js_1 = require("./getEvmBalances.js");
Object.defineProperty(exports, "getEvmErc20Balance", { enumerable: true, get: function () { return getEvmBalances_js_1.getEvmErc20Balance; } });
//# sourceMappingURL=index.js.map