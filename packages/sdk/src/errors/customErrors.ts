class SygmaSdkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class LiquidityError extends SygmaSdkError {
  availableLiquidity: bigint;

  constructor(destinationLiquidity: bigint) {
    super(
      `Destination chain liquidity is too low to perform this transfer. Transfer is limited to ${destinationLiquidity.toString()}`,
    );
    this.availableLiquidity = destinationLiquidity;
  }
}
