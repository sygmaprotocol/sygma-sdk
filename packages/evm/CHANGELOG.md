# Changelog

## [1.3.1](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.3.0...evm-v1.3.1) (2024-09-12)


### Bug Fixes

* `optionalMessage` and `optionalGas` encoding ([#536](https://github.com/sygmaprotocol/sygma-sdk/issues/536)) ([ebc8885](https://github.com/sygmaprotocol/sygma-sdk/commit/ebc8885a449ac5af88d34c11eb4eea3d20ef5540))

## [1.3.0](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.2.0...evm-v1.3.0) (2024-09-10)


### Features

* **evm:** Update SDK to Support New ERC20Handler with Optional Contract Call ([#504](https://github.com/sygmaprotocol/sygma-sdk/issues/504)) ([2cb56a2](https://github.com/sygmaprotocol/sygma-sdk/commit/2cb56a28a270502b3590460fd7c750ca53bb7333))

## [1.2.0](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.1.0...evm-v1.2.0) (2024-09-09)


### Features

* **bitcoin:** Added support for Bitcoin transfers ([#389](https://github.com/sygmaprotocol/sygma-sdk/issues/389)) ([1f428b1](https://github.com/sygmaprotocol/sygma-sdk/commit/1f428b1b4d8dd0a6b04488f532f3e9d10c5d1b15))

## [1.1.0](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.0.5...evm-v1.1.0) (2024-09-05)


### Features

* **evm:** Added support for creating cross chain non fungible asset transfer transactions ([#460](https://github.com/sygmaprotocol/sygma-sdk/issues/460)) ([6c40781](https://github.com/sygmaprotocol/sygma-sdk/commit/6c40781593c927a06a42f593c511520f41d028d5))

## [1.0.5](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.0.4...evm-v1.0.5) (2024-08-23)


### Bug Fixes

* Add missing `getDepositData` ([#499](https://github.com/sygmaprotocol/sygma-sdk/issues/499)) ([7c8a438](https://github.com/sygmaprotocol/sygma-sdk/commit/7c8a4387c16bfffe2250b5d71037c44a288d5585))

## [1.0.4](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.0.3...evm-v1.0.4) (2024-08-21)


### Bug Fixes

* Unified `tsconfig.json` in all subpackages to eliminate build discrepancies ([#487](https://github.com/sygmaprotocol/sygma-sdk/issues/487)) ([7be55ff](https://github.com/sygmaprotocol/sygma-sdk/commit/7be55ffed0dc079887ba7bfe11917dda4ddf890b))

## [1.0.3](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.0.2...evm-v1.0.3) (2024-08-20)


### Bug Fixes

* Add low balance validation  ([#481](https://github.com/sygmaprotocol/sygma-sdk/issues/481)) ([db4fcaf](https://github.com/sygmaprotocol/sygma-sdk/commit/db4fcaf879e673674bd5c1cf97b86bab59c4a0ff))

## [1.0.2](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.0.1...evm-v1.0.2) (2024-08-14)


### Bug Fixes

* release trigger ([#456](https://github.com/sygmaprotocol/sygma-sdk/issues/456)) ([e1792d9](https://github.com/sygmaprotocol/sygma-sdk/commit/e1792d9605ff1d51a0a96993e6814e4915ee35e3))

## [1.0.1](https://github.com/sygmaprotocol/sygma-sdk/compare/evm-v1.0.0...evm-v1.0.1) (2024-08-14)


### Bug Fixes

* EVM dependency ([#446](https://github.com/sygmaprotocol/sygma-sdk/issues/446)) ([2252d8e](https://github.com/sygmaprotocol/sygma-sdk/commit/2252d8eadb047bf8a87db9d25fe59d7fed684129))

## 1.0.0 (2024-08-13)


### Features

* Added Liquidity helper function in `@buildwithsygma/utils` ([#407](https://github.com/sygmaprotocol/sygma-sdk/issues/407)) ([ad7b041](https://github.com/sygmaprotocol/sygma-sdk/commit/ad7b041fd0ae510e3b91cf171ed9db15fccc1a2a))
* Implement fungible EVM transfers v3 ([#375](https://github.com/sygmaprotocol/sygma-sdk/issues/375)) ([f0806d3](https://github.com/sygmaprotocol/sygma-sdk/commit/f0806d3eb446c4228ca4956ebfcf498c51d7c406))
* Implement fungible substrate transfers  ([#378](https://github.com/sygmaprotocol/sygma-sdk/issues/378)) ([a1f0b50](https://github.com/sygmaprotocol/sygma-sdk/commit/a1f0b50ea8d90046595d72d876f012cbeb4048f2))
* Implement generic EVM-&gt;EVM transfers ([#392](https://github.com/sygmaprotocol/sygma-sdk/issues/392)) ([a24e1e7](https://github.com/sygmaprotocol/sygma-sdk/commit/a24e1e78c2945458a5891d82c695dc84640c5bdd))
* Lykhoyda/fix address format for destination ([#400](https://github.com/sygmaprotocol/sygma-sdk/issues/400)) ([6dfa9d2](https://github.com/sygmaprotocol/sygma-sdk/commit/6dfa9d238cfd6ab9cade9fae4cd33497d07d5d96)), closes [#367](https://github.com/sygmaprotocol/sygma-sdk/issues/367)


### Bug Fixes

* Fee issue on cronos causes transaction to fail ([#413](https://github.com/sygmaprotocol/sygma-sdk/issues/413)) ([6202fee](https://github.com/sygmaprotocol/sygma-sdk/commit/6202feefd0d40a1397d0e86d91586d0d486b2619))
* fixed faulty branch merge that breaks GMP ([#415](https://github.com/sygmaprotocol/sygma-sdk/issues/415)) ([4de22d6](https://github.com/sygmaprotocol/sygma-sdk/commit/4de22d68327830b8421d53e8e494abfe92fab426))
* Fixed maximum stack call error ([#394](https://github.com/sygmaprotocol/sygma-sdk/issues/394)) ([6f1b700](https://github.com/sygmaprotocol/sygma-sdk/commit/6f1b7004803749477b280f484e2d03d5b930a416))


### Miscellaneous Chores

* release 1.0.0 ([bb6a505](https://github.com/sygmaprotocol/sygma-sdk/commit/bb6a5053d843960f445f0dacebe101745f4d908f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @buildwithsygma/core bumped to 1.0.0
