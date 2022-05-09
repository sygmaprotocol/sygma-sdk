<p align="center"><a href="https://https://chainsafe.io/"><img width="250" title="Chainbridge UI" src='assets/chainsafe_logo.png'/></a></p>

# Chainbridge SDK

## Introduction
**Chainbridge SDK** is an OpenSource (under GNU Lesser General Public License v3.0) SDK for developers
to work with Chainsafe [Chainbridge](https://github.com/ChainSafe/chainbridge-core). SDK consist of methods for accomplish bridging capabilities between Ethereum networks.

***NOTE*** this is under an active development so can be broken occasionally.

The current SDK has one package that comprises the whole bridging logic for transferring ERC20 tokens between Ethereum networks. Alongside with this we have two folder examples that demonstrate the usage of our SDK. If you want to run the examples alongside our bridging infrastructure, please make sure you have [Chainbridge](https://github.com/ChainSafe/chainbridge-core) in order for you to run `make local-setup` command.

## Usefull commands.

After cloning the repo, simply run

```bash
npx lerna bootstrap
```

For React example, after you have run and deploy the contracts using [Chainbridge](https://github.com/ChainSafe/chainbridge-core), simply run:

```bash
yarn start:react-example
```

For NodeJS example, simply run:

```bash
yarn sdk:run-local-example
```

Notice that for NodeJS example to run properly you also are going to need local setup from `chainbrdige-core`.

## Support
<a href="https://discord.gg/ykXsJKfhgq">
  <img alt="discord" src="https://img.shields.io/discord/593655374469660673?label=Discord&logo=discord&style=flat" />
</a>

## License
GNU Lesser General Public License v3.0
