"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityError = void 0;
class SygmaSdkError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
class LiquidityError extends SygmaSdkError {
    constructor(destinationLiquidity) {
        super(`Destination chain liquidity is too low to perform this transfer. Transfer is limited to ${destinationLiquidity.toString()}`);
        this.availableLiquidity = destinationLiquidity;
    }
}
exports.LiquidityError = LiquidityError;
//# sourceMappingURL=customErrors.js.map