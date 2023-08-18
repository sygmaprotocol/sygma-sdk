# Changelog

## [2.3.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v2.2.0...sygma-sdk-core-v2.3.0) (2023-08-18)


### Features

* Destination network liquidity check ([#290](https://github.com/sygmaprotocol/sygma-sdk/issues/290)) ([ede1479](https://github.com/sygmaprotocol/sygma-sdk/commit/ede147982bc1f978a216b2904340ca60027fc402))

## [2.2.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v2.1.0...sygma-sdk-core-v2.2.0) (2023-08-02)


### Features

* Generic Message passing ([#285](https://github.com/sygmaprotocol/sygma-sdk/issues/285)) ([5cc18ee](https://github.com/sygmaprotocol/sygma-sdk/commit/5cc18ee238ac3a1b0ab60188f4c2341d1f478a05))
* parachain support ([#289](https://github.com/sygmaprotocol/sygma-sdk/issues/289)) ([5f829e8](https://github.com/sygmaprotocol/sygma-sdk/commit/5f829e8ef48cfa51cc11b4abd861fab5904dba98))


### Bug Fixes

* Ensure transfer amount greater than fee ([#280](https://github.com/sygmaprotocol/sygma-sdk/issues/280)) ([9950015](https://github.com/sygmaprotocol/sygma-sdk/commit/9950015a6f28580360cd4b92e7a205c967e7634f))
* Token decimals ([#276](https://github.com/sygmaprotocol/sygma-sdk/issues/276)) ([badb201](https://github.com/sygmaprotocol/sygma-sdk/commit/badb2019f1e5b0f768cd1cabc47378b9736805d7))

## [2.1.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v2.0.1...sygma-sdk-core-v2.1.0) (2023-06-22)


### Features

* add helper to create Transfer object ([#267](https://github.com/sygmaprotocol/sygma-sdk/issues/267)) ([930edb0](https://github.com/sygmaprotocol/sygma-sdk/commit/930edb0fd6bb2ee77c9f18dc32a77bc2683dcfd8))


### Bug Fixes

* update createDestinationMultiLocation to use Xcm V3 Multilocation ([#270](https://github.com/sygmaprotocol/sygma-sdk/issues/270)) ([f95efc4](https://github.com/sygmaprotocol/sygma-sdk/commit/f95efc4380bc0cac3aa81feb0d8b74b08c01b928))

## [2.0.1](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v2.0.0...sygma-sdk-core-v2.0.1) (2023-06-05)


### Bug Fixes

* add license to the sdk package ([#259](https://github.com/sygmaprotocol/sygma-sdk/issues/259)) ([276d278](https://github.com/sygmaprotocol/sygma-sdk/commit/276d278a5d34c7e54aa3549817709b9165a9dd66))

## [2.0.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.5.0...sygma-sdk-core-v2.0.0) (2023-06-02)


### ⚠ BREAKING CHANGES

* evm asset transfer ([#240](https://github.com/sygmaprotocol/sygma-sdk/issues/240))

### Features

* add Config class and types ([#239](https://github.com/sygmaprotocol/sygma-sdk/issues/239)) ([0e2a0ec](https://github.com/sygmaprotocol/sygma-sdk/commit/0e2a0ecd3acc724db5109145516f1d374377f23c))
* evm asset transfer ([#240](https://github.com/sygmaprotocol/sygma-sdk/issues/240)) ([23cb4eb](https://github.com/sygmaprotocol/sygma-sdk/commit/23cb4eb5d4e15d8eb134b8902a942f47a73dad78))
* Move deprecated Sygma Class to separate namespace, update main project README and regenerate docs ([#233](https://github.com/sygmaprotocol/sygma-sdk/issues/233)) ([cb3d79f](https://github.com/sygmaprotocol/sygma-sdk/commit/cb3d79f628eb7c4ca7345aec013c077c9afbf0a4))
* substrate asset transfer ([#250](https://github.com/sygmaprotocol/sygma-sdk/issues/250)) ([7c41037](https://github.com/sygmaprotocol/sygma-sdk/commit/7c410376f015ae9d214d3f47106bef5e140aa353))


### Bug Fixes

* fix cjs build not working ([#248](https://github.com/sygmaprotocol/sygma-sdk/issues/248)) ([bb09a5a](https://github.com/sygmaprotocol/sygma-sdk/commit/bb09a5ae9297a10f02ebaac0cacd05665f0fad38))
* update permissionless generic deposit data ([#246](https://github.com/sygmaprotocol/sygma-sdk/issues/246)) ([2a41749](https://github.com/sygmaprotocol/sygma-sdk/commit/2a41749a591a2ebf6184a888a2d9aa23f9e42d69))

## [1.5.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.4.0...sygma-sdk-core-v1.5.0) (2023-04-26)


### Features

* Create EVM to Substrate example ([#219](https://github.com/sygmaprotocol/sygma-sdk/issues/219)) ([01f8f78](https://github.com/sygmaprotocol/sygma-sdk/commit/01f8f78825a3f1d6f3aea7a41377ffb8ca2ad528))
* Generate docs based on jsdoc annotations ([#221](https://github.com/sygmaprotocol/sygma-sdk/issues/221)) ([c213370](https://github.com/sygmaprotocol/sygma-sdk/commit/c213370065785e51ad4bf0fe1db6a21fe81dc9cb))
* Improve EVM helpers with Unit Tests ([#223](https://github.com/sygmaprotocol/sygma-sdk/issues/223)) ([9dee18d](https://github.com/sygmaprotocol/sygma-sdk/commit/9dee18d1e06ec1b1b232e64ddcb8b8777a341604))

## [1.4.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.3.0...sygma-sdk-core-v1.4.0) (2023-04-10)


### Features

* Extract event listeners functions for Deposit and ProposalExecution to EVM folder from Sygma class ([#207](https://github.com/sygmaprotocol/sygma-sdk/issues/207)) ([b471a5d](https://github.com/sygmaprotocol/sygma-sdk/commit/b471a5d57dd0a04fbc14555dcd45212f1941e2ac))
* Extract or move current evm fee related functions to EVM folder ([#209](https://github.com/sygmaprotocol/sygma-sdk/issues/209)) ([d18ce85](https://github.com/sygmaprotocol/sygma-sdk/commit/d18ce85e7da38cbc00601ff6529ebc30f480b4ed))
* Implement MultiLocation support in the deposit method in EVM and Substrate ([#208](https://github.com/sygmaprotocol/sygma-sdk/issues/208)) ([05f27ea](https://github.com/sygmaprotocol/sygma-sdk/commit/05f27eae67820f9a2e65af8628f015198cf6a3a8))
* NodeJS compatibility, Substrate deposit upgrade, Jsdoc examples updated ([#217](https://github.com/sygmaprotocol/sygma-sdk/issues/217)) ([4f8c94a](https://github.com/sygmaprotocol/sygma-sdk/commit/4f8c94a7e5613347b4fb294307f637415b571061))

## [1.3.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.2.1...sygma-sdk-core-v1.3.0) (2023-03-30)


### Features

* Extract deposit and approval functions to EVM folder from Sygma class ([#204](https://github.com/sygmaprotocol/sygma-sdk/issues/204)) ([b9396e3](https://github.com/sygmaprotocol/sygma-sdk/commit/b9396e341a69b453819cd9c94d34a0abfbf61170))
* Methods to set fee settings and general usage with shared config ([#212](https://github.com/sygmaprotocol/sygma-sdk/issues/212)) ([e4b3eaa](https://github.com/sygmaprotocol/sygma-sdk/commit/e4b3eaa31ebbfd7503f8216919f2fed49491c121))

## [1.2.1](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.2.0...sygma-sdk-core-v1.2.1) (2023-03-20)


### Bug Fixes

* Multibuild to esm and commonjs ([#183](https://github.com/sygmaprotocol/sygma-sdk/issues/183)) ([bee7188](https://github.com/sygmaprotocol/sygma-sdk/commit/bee71882f5c62606465f2c95b0b199b4850ee2ce))

## [1.2.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.2.0...sygma-sdk-core-v1.2.0) (2023-03-15)


### Features

* Add blocks confirmation amount param to config ([#140](https://github.com/sygmaprotocol/sygma-sdk/issues/140)) ([b3c5062](https://github.com/sygmaprotocol/sygma-sdk/commit/b3c50627f2219b43234abb4f548dbed9a77300a4))
* Add ERC721 support to SDK ([#82](https://github.com/sygmaprotocol/sygma-sdk/issues/82)) ([1222bea](https://github.com/sygmaprotocol/sygma-sdk/commit/1222bea1ec027d323d1974dd1c236a24951e769d))
* Adds msgGasLimit as param when requesting fee from fee oracle service ([#136](https://github.com/sygmaprotocol/sygma-sdk/issues/136)) ([449b5fa](https://github.com/sygmaprotocol/sygma-sdk/commit/449b5fa627158dbe04d04cd298def80a7d626c1f))
* Create ERC721 example application and documents ([#83](https://github.com/sygmaprotocol/sygma-sdk/issues/83)) ([f6ce371](https://github.com/sygmaprotocol/sygma-sdk/commit/f6ce371c0a1f410050ddd4b01954f00c38d1f571))
* node example for generic handler ([#100](https://github.com/sygmaprotocol/sygma-sdk/issues/100)) ([247dd7b](https://github.com/sygmaprotocol/sygma-sdk/commit/247dd7bf19ff97dd3fe3955168f2829f6f9fe62f))
* sdk support for generic handler and generic example app ([#85](https://github.com/sygmaprotocol/sygma-sdk/issues/85)) ([3365923](https://github.com/sygmaprotocol/sygma-sdk/commit/3365923b7aa215988cedc9e9b6019dece1b2e86d))
* substrate support to SDK ([#154](https://github.com/sygmaprotocol/sygma-sdk/issues/154)) ([856c231](https://github.com/sygmaprotocol/sygma-sdk/commit/856c2315fda53176c562215c0a9c9ede5f593a57))
* Update deposit method to support substrate addresses ([#189](https://github.com/sygmaprotocol/sygma-sdk/issues/189)) ([a569165](https://github.com/sygmaprotocol/sygma-sdk/commit/a5691651440f482c0b027b40827f92e86dc1b333))
* update utility functions to accomodate permissionless and permissioned handlers ([#132](https://github.com/sygmaprotocol/sygma-sdk/issues/132)) ([e49feac](https://github.com/sygmaprotocol/sygma-sdk/commit/e49feace8a43dc8579339a0567c5124fb93f2ce6))


### Bug Fixes

* add getApproved to the readme ([#120](https://github.com/sygmaprotocol/sygma-sdk/issues/120)) ([ae4981b](https://github.com/sygmaprotocol/sygma-sdk/commit/ae4981bca9327f830ebc8af89ca374fc369063a7))
* Check/update dependencies for packages ([#138](https://github.com/sygmaprotocol/sygma-sdk/issues/138)) ([b4875e8](https://github.com/sygmaprotocol/sygma-sdk/commit/b4875e810fdd9bd841c0c1add9858c00616ffc47))
* destination network selection  ([#104](https://github.com/sygmaprotocol/sygma-sdk/issues/104)) ([3f2dbb1](https://github.com/sygmaprotocol/sygma-sdk/commit/3f2dbb163219395715b4b6f418903181be81f5bc))
* fix amount in createOracleFeeData ([#162](https://github.com/sygmaprotocol/sygma-sdk/issues/162)) ([a39180d](https://github.com/sygmaprotocol/sygma-sdk/commit/a39180d5e9d5993ee6c15abc6aa8a6e1c1939632))
* fix imports ([#135](https://github.com/sygmaprotocol/sygma-sdk/issues/135)) ([19c43e1](https://github.com/sygmaprotocol/sygma-sdk/commit/19c43e16411ef4406e8c9866d2924bfb81d1ef4e))
* Fix url to query oracle service ([#159](https://github.com/sygmaprotocol/sygma-sdk/issues/159)) ([ea762a0](https://github.com/sygmaprotocol/sygma-sdk/commit/ea762a0a8df2d5c7a291bc818a386a46df55fec2))
* linter issues ([#149](https://github.com/sygmaprotocol/sygma-sdk/issues/149)) ([20c537d](https://github.com/sygmaprotocol/sygma-sdk/commit/20c537d983dbdba270264a7b551f7719b3cd0f1d))
* Remove linked dependency from examples ([#139](https://github.com/sygmaprotocol/sygma-sdk/issues/139)) ([430f1b5](https://github.com/sygmaprotocol/sygma-sdk/commit/430f1b5645af654a2e750fc045ae54f2a064859c))
* remove unneccessary dependencies ([#163](https://github.com/sygmaprotocol/sygma-sdk/issues/163)) ([dec73cd](https://github.com/sygmaprotocol/sygma-sdk/commit/dec73cd0a7380812b59d23327edd333a3030bb8d))
* updated readme ([#87](https://github.com/sygmaprotocol/sygma-sdk/issues/87)) ([f99d237](https://github.com/sygmaprotocol/sygma-sdk/commit/f99d2374a06c80c4af41f7dad13f7eff1598c753))
* updated readme in sdk ([#118](https://github.com/sygmaprotocol/sygma-sdk/issues/118)) ([4ca6317](https://github.com/sygmaprotocol/sygma-sdk/commit/4ca6317c97f2b4daca7d88beeebe3f5c394248a8))
* usage of deprecated `substr` ([#157](https://github.com/sygmaprotocol/sygma-sdk/issues/157)) ([94a67c9](https://github.com/sygmaprotocol/sygma-sdk/commit/94a67c97d4fdfc3bcfd6a7856b4754263d810473))



### Miscellaneous Chores

* release 1.0.0 ([bb6a505](https://github.com/sygmaprotocol/sygma-sdk/commit/bb6a5053d843960f445f0dacebe101745f4d908f))
* updating package to sygma-contracts ([#36](https://github.com/sygmaprotocol/sygma-sdk/issues/36)) ([e3af317](https://github.com/sygmaprotocol/sygma-sdk/commit/e3af31750a12564ff8c4df01fef453053b02c8d9))



## [1.1.4](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.1.3...sygma-sdk-core-v1.1.4) (2023-02-22)


### Bug Fixes

* remove unneccessary dependencies ([#163](https://github.com/sygmaprotocol/sygma-sdk/issues/163)) ([dec73cd](https://github.com/sygmaprotocol/sygma-sdk/commit/dec73cd0a7380812b59d23327edd333a3030bb8d))

## [1.1.3](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.1.2...sygma-sdk-core-v1.1.3) (2023-02-14)


### Bug Fixes

* fix amount in createOracleFeeData ([#162](https://github.com/sygmaprotocol/sygma-sdk/issues/162)) ([a39180d](https://github.com/sygmaprotocol/sygma-sdk/commit/a39180d5e9d5993ee6c15abc6aa8a6e1c1939632))

## [1.1.2](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.1.1...sygma-sdk-core-v1.1.2) (2023-02-10)


### Bug Fixes

* Fix url to query oracle service ([#159](https://github.com/sygmaprotocol/sygma-sdk/issues/159)) ([ea762a0](https://github.com/sygmaprotocol/sygma-sdk/commit/ea762a0a8df2d5c7a291bc818a386a46df55fec2))

## [1.1.1](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.1.0...sygma-sdk-core-v1.1.1) (2023-02-06)


### Bug Fixes

* Check/update dependencies for packages ([#138](https://github.com/sygmaprotocol/sygma-sdk/issues/138)) ([b4875e8](https://github.com/sygmaprotocol/sygma-sdk/commit/b4875e810fdd9bd841c0c1add9858c00616ffc47))
* linter issues ([#149](https://github.com/sygmaprotocol/sygma-sdk/issues/149)) ([20c537d](https://github.com/sygmaprotocol/sygma-sdk/commit/20c537d983dbdba270264a7b551f7719b3cd0f1d))
* Remove linked dependency from examples ([#139](https://github.com/sygmaprotocol/sygma-sdk/issues/139)) ([430f1b5](https://github.com/sygmaprotocol/sygma-sdk/commit/430f1b5645af654a2e750fc045ae54f2a064859c))
* usage of deprecated `substr` ([#157](https://github.com/sygmaprotocol/sygma-sdk/issues/157)) ([94a67c9](https://github.com/sygmaprotocol/sygma-sdk/commit/94a67c97d4fdfc3bcfd6a7856b4754263d810473))

## [1.1.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.0.4...sygma-sdk-core-v1.1.0) (2023-01-13)


### Features

* Add blocks confirmation amount param to config ([#140](https://github.com/sygmaprotocol/sygma-sdk/issues/140)) ([b3c5062](https://github.com/sygmaprotocol/sygma-sdk/commit/b3c50627f2219b43234abb4f548dbed9a77300a4))
* Adds msgGasLimit as param when requesting fee from fee oracle service ([#136](https://github.com/sygmaprotocol/sygma-sdk/issues/136)) ([449b5fa](https://github.com/sygmaprotocol/sygma-sdk/commit/449b5fa627158dbe04d04cd298def80a7d626c1f))
* update utility functions to accomodate permissionless and permissioned handlers ([#132](https://github.com/sygmaprotocol/sygma-sdk/issues/132)) ([e49feac](https://github.com/sygmaprotocol/sygma-sdk/commit/e49feace8a43dc8579339a0567c5124fb93f2ce6))


### Bug Fixes

* fix imports ([#135](https://github.com/sygmaprotocol/sygma-sdk/issues/135)) ([19c43e1](https://github.com/sygmaprotocol/sygma-sdk/commit/19c43e16411ef4406e8c9866d2924bfb81d1ef4e))

## [1.0.4](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.0.3...sygma-sdk-core-v1.0.4) (2022-11-07)


### Bug Fixes

* destination network selection  ([#104](https://github.com/sygmaprotocol/sygma-sdk/issues/104)) ([3f2dbb1](https://github.com/sygmaprotocol/sygma-sdk/commit/3f2dbb163219395715b4b6f418903181be81f5bc))

## [1.0.3](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.0.2...sygma-sdk-core-v1.0.3) (2022-11-07)


### Bug Fixes

* add getApproved to the readme ([#120](https://github.com/sygmaprotocol/sygma-sdk/issues/120)) ([ae4981b](https://github.com/sygmaprotocol/sygma-sdk/commit/ae4981bca9327f830ebc8af89ca374fc369063a7))

## [1.0.2](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.0.1...sygma-sdk-core-v1.0.2) (2022-11-07)


### Bug Fixes

* updated readme in sdk ([#118](https://github.com/sygmaprotocol/sygma-sdk/issues/118)) ([4ca6317](https://github.com/sygmaprotocol/sygma-sdk/commit/4ca6317c97f2b4daca7d88beeebe3f5c394248a8))

## [1.0.1](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.0.1...sygma-sdk-core-v1.0.1) (2022-11-07)


### Features

* Add ERC721 support to SDK ([#82](https://github.com/sygmaprotocol/sygma-sdk/issues/82)) ([1222bea](https://github.com/sygmaprotocol/sygma-sdk/commit/1222bea1ec027d323d1974dd1c236a24951e769d))
* Create ERC721 example application and documents ([#83](https://github.com/sygmaprotocol/sygma-sdk/issues/83)) ([f6ce371](https://github.com/sygmaprotocol/sygma-sdk/commit/f6ce371c0a1f410050ddd4b01954f00c38d1f571))
* node example for generic handler ([#100](https://github.com/sygmaprotocol/sygma-sdk/issues/100)) ([247dd7b](https://github.com/sygmaprotocol/sygma-sdk/commit/247dd7bf19ff97dd3fe3955168f2829f6f9fe62f))
* sdk support for generic handler and generic example app ([#85](https://github.com/sygmaprotocol/sygma-sdk/issues/85)) ([3365923](https://github.com/sygmaprotocol/sygma-sdk/commit/3365923b7aa215988cedc9e9b6019dece1b2e86d))


### Bug Fixes

* updated readme ([#87](https://github.com/sygmaprotocol/sygma-sdk/issues/87)) ([f99d237](https://github.com/sygmaprotocol/sygma-sdk/commit/f99d2374a06c80c4af41f7dad13f7eff1598c753))


### Reverts

* "chore(main): release 1.0.0" ([#23](https://github.com/sygmaprotocol/sygma-sdk/issues/23)) ([1aa6b87](https://github.com/sygmaprotocol/sygma-sdk/commit/1aa6b87772de69b59d6d728ad8815c79b01846b8))
* "chore(main): release 1.0.0" ([#29](https://github.com/sygmaprotocol/sygma-sdk/issues/29)) ([9484aa1](https://github.com/sygmaprotocol/sygma-sdk/commit/9484aa1182e1098e5be2723de3d0d4785b5b9a1e))
* "chore(main): release 1.0.0" ([#33](https://github.com/sygmaprotocol/sygma-sdk/issues/33)) ([25623fb](https://github.com/sygmaprotocol/sygma-sdk/commit/25623fb9e5b352c3dd6d6222af6360668c008eb9))
* "chore(main): release 1.0.1" ([#53](https://github.com/sygmaprotocol/sygma-sdk/issues/53)) ([e9ad66b](https://github.com/sygmaprotocol/sygma-sdk/commit/e9ad66bae8f0a215f924646afdc15446fa5f5fd3))
* "chore(main): release 1.0.1" ([#55](https://github.com/sygmaprotocol/sygma-sdk/issues/55)) ([f389daf](https://github.com/sygmaprotocol/sygma-sdk/commit/f389daf09d780f1d232bc15447945bcd06bb9dd5))
* "chore(main): release 1.0.1"" ([#62](https://github.com/sygmaprotocol/sygma-sdk/issues/62)) ([2c4f56a](https://github.com/sygmaprotocol/sygma-sdk/commit/2c4f56ab2ac0b4575497d65df0584abafc0a2a43))
* "chore(main): release sygma-sdk-core 1.0.0" ([#71](https://github.com/sygmaprotocol/sygma-sdk/issues/71)) ([5416542](https://github.com/sygmaprotocol/sygma-sdk/commit/5416542acec704dd18e2a7dce5f15621e9c7c4fd))
* "chore(main): release sygma-sdk-core 1.0.0" ([#73](https://github.com/sygmaprotocol/sygma-sdk/issues/73)) ([b2f9939](https://github.com/sygmaprotocol/sygma-sdk/commit/b2f9939b2fd754f4ba2d1ab5509668e2e67a4e9a))
* "chore(main): release sygma-sdk-core 1.0.0" ([#75](https://github.com/sygmaprotocol/sygma-sdk/issues/75)) ([5d0b5d1](https://github.com/sygmaprotocol/sygma-sdk/commit/5d0b5d1c6f3038c498cfd977a0af5e92826a054a))


### Miscellaneous Chores

* release 1.0.0 ([bb6a505](https://github.com/sygmaprotocol/sygma-sdk/commit/bb6a5053d843960f445f0dacebe101745f4d908f))
* updating package to sygma-contracts ([#36](https://github.com/sygmaprotocol/sygma-sdk/issues/36)) ([e3af317](https://github.com/sygmaprotocol/sygma-sdk/commit/e3af31750a12564ff8c4df01fef453053b02c8d9))

## [1.0.1](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.1.0...sygma-sdk-core-v1.0.1) (2022-11-07)


### Features

* Add ERC721 support to SDK ([#82](https://github.com/sygmaprotocol/sygma-sdk/issues/82)) ([1222bea](https://github.com/sygmaprotocol/sygma-sdk/commit/1222bea1ec027d323d1974dd1c236a24951e769d))
* Create ERC721 example application and documents ([#83](https://github.com/sygmaprotocol/sygma-sdk/issues/83)) ([f6ce371](https://github.com/sygmaprotocol/sygma-sdk/commit/f6ce371c0a1f410050ddd4b01954f00c38d1f571))
* node example for generic handler ([#100](https://github.com/sygmaprotocol/sygma-sdk/issues/100)) ([247dd7b](https://github.com/sygmaprotocol/sygma-sdk/commit/247dd7bf19ff97dd3fe3955168f2829f6f9fe62f))
* sdk support for generic handler and generic example app ([#85](https://github.com/sygmaprotocol/sygma-sdk/issues/85)) ([3365923](https://github.com/sygmaprotocol/sygma-sdk/commit/3365923b7aa215988cedc9e9b6019dece1b2e86d))


### Bug Fixes

* updated readme ([#87](https://github.com/sygmaprotocol/sygma-sdk/issues/87)) ([f99d237](https://github.com/sygmaprotocol/sygma-sdk/commit/f99d2374a06c80c4af41f7dad13f7eff1598c753))


### Reverts

* "chore(main): release 1.0.0" ([#23](https://github.com/sygmaprotocol/sygma-sdk/issues/23)) ([1aa6b87](https://github.com/sygmaprotocol/sygma-sdk/commit/1aa6b87772de69b59d6d728ad8815c79b01846b8))
* "chore(main): release 1.0.0" ([#29](https://github.com/sygmaprotocol/sygma-sdk/issues/29)) ([9484aa1](https://github.com/sygmaprotocol/sygma-sdk/commit/9484aa1182e1098e5be2723de3d0d4785b5b9a1e))
* "chore(main): release 1.0.0" ([#33](https://github.com/sygmaprotocol/sygma-sdk/issues/33)) ([25623fb](https://github.com/sygmaprotocol/sygma-sdk/commit/25623fb9e5b352c3dd6d6222af6360668c008eb9))
* "chore(main): release 1.0.1" ([#53](https://github.com/sygmaprotocol/sygma-sdk/issues/53)) ([e9ad66b](https://github.com/sygmaprotocol/sygma-sdk/commit/e9ad66bae8f0a215f924646afdc15446fa5f5fd3))
* "chore(main): release 1.0.1" ([#55](https://github.com/sygmaprotocol/sygma-sdk/issues/55)) ([f389daf](https://github.com/sygmaprotocol/sygma-sdk/commit/f389daf09d780f1d232bc15447945bcd06bb9dd5))
* "chore(main): release 1.0.1"" ([#62](https://github.com/sygmaprotocol/sygma-sdk/issues/62)) ([2c4f56a](https://github.com/sygmaprotocol/sygma-sdk/commit/2c4f56ab2ac0b4575497d65df0584abafc0a2a43))
* "chore(main): release sygma-sdk-core 1.0.0" ([#71](https://github.com/sygmaprotocol/sygma-sdk/issues/71)) ([5416542](https://github.com/sygmaprotocol/sygma-sdk/commit/5416542acec704dd18e2a7dce5f15621e9c7c4fd))
* "chore(main): release sygma-sdk-core 1.0.0" ([#73](https://github.com/sygmaprotocol/sygma-sdk/issues/73)) ([b2f9939](https://github.com/sygmaprotocol/sygma-sdk/commit/b2f9939b2fd754f4ba2d1ab5509668e2e67a4e9a))
* "chore(main): release sygma-sdk-core 1.0.0" ([#75](https://github.com/sygmaprotocol/sygma-sdk/issues/75)) ([5d0b5d1](https://github.com/sygmaprotocol/sygma-sdk/commit/5d0b5d1c6f3038c498cfd977a0af5e92826a054a))


### Miscellaneous Chores

* release 1.0.0 ([bb6a505](https://github.com/sygmaprotocol/sygma-sdk/commit/bb6a5053d843960f445f0dacebe101745f4d908f))
* updating package to sygma-contracts ([#36](https://github.com/sygmaprotocol/sygma-sdk/issues/36)) ([e3af317](https://github.com/sygmaprotocol/sygma-sdk/commit/e3af31750a12564ff8c4df01fef453053b02c8d9))

## [1.1.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.0.1...sygma-sdk-core-v1.1.0) (2022-11-07)


### Features

* Create ERC721 example application and documents ([#83](https://github.com/sygmaprotocol/sygma-sdk/issues/83)) ([f6ce371](https://github.com/sygmaprotocol/sygma-sdk/commit/f6ce371c0a1f410050ddd4b01954f00c38d1f571))
* node example for generic handler ([#100](https://github.com/sygmaprotocol/sygma-sdk/issues/100)) ([247dd7b](https://github.com/sygmaprotocol/sygma-sdk/commit/247dd7bf19ff97dd3fe3955168f2829f6f9fe62f))
* sdk support for generic handler and generic example app ([#85](https://github.com/sygmaprotocol/sygma-sdk/issues/85)) ([3365923](https://github.com/sygmaprotocol/sygma-sdk/commit/3365923b7aa215988cedc9e9b6019dece1b2e86d))


### Bug Fixes

* updated readme ([#87](https://github.com/sygmaprotocol/sygma-sdk/issues/87)) ([f99d237](https://github.com/sygmaprotocol/sygma-sdk/commit/f99d2374a06c80c4af41f7dad13f7eff1598c753))

## [1.1.0](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v1.0.1...sygma-sdk-core-v1.1.0) (2022-11-04)


### Features

* Create ERC721 example application and documents ([#83](https://github.com/sygmaprotocol/sygma-sdk/issues/83)) ([f6ce371](https://github.com/sygmaprotocol/sygma-sdk/commit/f6ce371c0a1f410050ddd4b01954f00c38d1f571))
* node example for generic handler ([#100](https://github.com/sygmaprotocol/sygma-sdk/issues/100)) ([247dd7b](https://github.com/sygmaprotocol/sygma-sdk/commit/247dd7bf19ff97dd3fe3955168f2829f6f9fe62f))
* sdk support for generic handler and generic example app ([#85](https://github.com/sygmaprotocol/sygma-sdk/issues/85)) ([3365923](https://github.com/sygmaprotocol/sygma-sdk/commit/3365923b7aa215988cedc9e9b6019dece1b2e86d))


### Bug Fixes

* updated readme ([#87](https://github.com/sygmaprotocol/sygma-sdk/issues/87)) ([f99d237](https://github.com/sygmaprotocol/sygma-sdk/commit/f99d2374a06c80c4af41f7dad13f7eff1598c753))

## [1.0.1](https://github.com/sygmaprotocol/sygma-sdk/compare/sygma-sdk-core-v0.0.9...sygma-sdk-core-v1.0.1) (2022-09-28)


### Features

* Add ERC721 support to SDK ([#82](https://github.com/sygmaprotocol/sygma-sdk/issues/82)) ([1222bea](https://github.com/sygmaprotocol/sygma-sdk/commit/1222bea1ec027d323d1974dd1c236a24951e769d))


### Reverts

* "chore(main): release 1.0.0" ([#23](https://github.com/sygmaprotocol/sygma-sdk/issues/23)) ([1aa6b87](https://github.com/sygmaprotocol/sygma-sdk/commit/1aa6b87772de69b59d6d728ad8815c79b01846b8))
* "chore(main): release 1.0.0" ([#29](https://github.com/sygmaprotocol/sygma-sdk/issues/29)) ([9484aa1](https://github.com/sygmaprotocol/sygma-sdk/commit/9484aa1182e1098e5be2723de3d0d4785b5b9a1e))
* "chore(main): release 1.0.0" ([#33](https://github.com/sygmaprotocol/sygma-sdk/issues/33)) ([25623fb](https://github.com/sygmaprotocol/sygma-sdk/commit/25623fb9e5b352c3dd6d6222af6360668c008eb9))
* "chore(main): release 1.0.1" ([#53](https://github.com/sygmaprotocol/sygma-sdk/issues/53)) ([e9ad66b](https://github.com/sygmaprotocol/sygma-sdk/commit/e9ad66bae8f0a215f924646afdc15446fa5f5fd3))
* "chore(main): release 1.0.1" ([#55](https://github.com/sygmaprotocol/sygma-sdk/issues/55)) ([f389daf](https://github.com/sygmaprotocol/sygma-sdk/commit/f389daf09d780f1d232bc15447945bcd06bb9dd5))
* "chore(main): release 1.0.1"" ([#62](https://github.com/sygmaprotocol/sygma-sdk/issues/62)) ([2c4f56a](https://github.com/sygmaprotocol/sygma-sdk/commit/2c4f56ab2ac0b4575497d65df0584abafc0a2a43))
* "chore(main): release sygma-sdk-core 1.0.0" ([#71](https://github.com/sygmaprotocol/sygma-sdk/issues/71)) ([5416542](https://github.com/sygmaprotocol/sygma-sdk/commit/5416542acec704dd18e2a7dce5f15621e9c7c4fd))
* "chore(main): release sygma-sdk-core 1.0.0" ([#73](https://github.com/sygmaprotocol/sygma-sdk/issues/73)) ([b2f9939](https://github.com/sygmaprotocol/sygma-sdk/commit/b2f9939b2fd754f4ba2d1ab5509668e2e67a4e9a))
* "chore(main): release sygma-sdk-core 1.0.0" ([#75](https://github.com/sygmaprotocol/sygma-sdk/issues/75)) ([5d0b5d1](https://github.com/sygmaprotocol/sygma-sdk/commit/5d0b5d1c6f3038c498cfd977a0af5e92826a054a))


### Miscellaneous Chores

* release 1.0.0 ([bb6a505](https://github.com/sygmaprotocol/sygma-sdk/commit/bb6a5053d843960f445f0dacebe101745f4d908f))
* updating package to sygma-contracts ([#36](https://github.com/sygmaprotocol/sygma-sdk/issues/36)) ([e3af317](https://github.com/sygmaprotocol/sygma-sdk/commit/e3af31750a12564ff8c4df01fef453053b02c8d9))
