class SygmaSdkError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
export class LiquidityError extends SygmaSdkError {
    constructor(destinationLiquidity) {
        super(`Destination chain liquidity is too low to perform this transfer. Transfer is limited to ${destinationLiquidity.toString()}`);
        this.availableLiquidity = destinationLiquidity;
    }
}
//# sourceMappingURL=customErrors.js.map