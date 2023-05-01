# Fees

Before submitting a deposit transaction, fee type and amount must be obtained.

Each resource may have a different fee strategy. Currently, [Sygma supports two fee strategies: Static and Dynamic](https://github.com/sygmaprotocol/sygma-relayer/blob/main/docs/general/Fees.md#fee-strategies). The SDK contains the [`fetchFeeData()`](https://github.com/sygmaprotocol/sygma-sdk/blob/324d77cd9c0398e9ffddd85481675bbb3b4cdf45/packages/sdk/src/Sygma.ts#L564) method, which identifies the fee strategy for a particular resource based on its configuration and fetches final fee accordingly. Additionally, the SDK includes methods for retrieving fee information for a specific strategy:  [`fetchBasicFeeData()`](https://github.com/sygmaprotocol/sygma-sdk/blob/324d77cd9c0398e9ffddd85481675bbb3b4cdf45/packages/sdk/src/Sygma.ts#L601) and [`fetchFeeOracleData()`](https://github.com/sygmaprotocol/sygma-sdk/blob/324d77cd9c0398e9ffddd85481675bbb3b4cdf45/packages/sdk/src/Sygma.ts#L640).

> Static fee strategy - The fee is a static pre-configured on-chain value. For more information, please refer to the [Static fee strategy section](https://github.com/sygmaprotocol/sygma-relayer/blob/main/docs/general/Fees.md#static-fee-strategy).

![](/docs/assets/static-fee.png)

> Dynamic fee strategy - The fee is determined by fetching a fee estimate from [Sygma's Fee Oracle service](https://github.com/sygmaprotocol/sygma-fee-oracle/blob/home/docs/Home.md), which calculates the execution cost on the destination chain. For more information, please refer to the [Dynamic fee strategy section](https://github.com/sygmaprotocol/sygma-relayer/blob/main/docs/general/Fees.md#dynamic-fee-strategy).

![](/docs/assets/dynamic-fee.png)