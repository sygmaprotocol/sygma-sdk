declare class SygmaSdkError extends Error {
    constructor(message: string);
}
export declare class LiquidityError extends SygmaSdkError {
    availableLiquidity: bigint;
    constructor(destinationLiquidity: bigint);
}
export {};
//# sourceMappingURL=customErrors.d.ts.map