import { ERC721MinterBurnerPauser__factory } from '@buildwithsygma/sygma-contracts';
import { utils, BigNumber, providers } from 'ethers';
import { Connector } from '../connectors';

import {
  BridgeData,
  Bridges,
  ChainbridgeContracts,
  SygmaErc20Contracts,
  SygmaProviders,
} from '../types';

export const computeBridges = (contracts: ChainbridgeContracts): Bridges =>
  Object.keys(contracts).reduce((bridges, chain) => {
    const { bridge } = contracts[chain];
    bridges = {
      ...bridges,
      [chain]: bridge,
    };

    return bridges;
  }, {});

export const computeERC20Contracts = (contracts: ChainbridgeContracts): SygmaErc20Contracts =>
  Object.keys(contracts).reduce((erc20Contracts, chain) => {
    const { erc20 } = contracts[chain];
    erc20Contracts = {
      ...erc20Contracts,
      [chain]: erc20,
    };

    return erc20Contracts;
  }, {});

export const computeProvidersAndSignersRPC = (
  bridgeSetup: BridgeData,
  address?: string,
): SygmaProviders => {
  return {
    chain1: setConnectorRPC(bridgeSetup.chain1.rpcUrl, address),
    chain2: setConnectorRPC(bridgeSetup.chain2.rpcUrl, address),
  };
};

export const computeProvidersAndSignersWeb3 = (
  bridgeSetup: BridgeData,
  web3providerInstance: providers.ExternalProvider,
): SygmaProviders => {
  return {
    chain1: setConnectorWeb3(web3providerInstance),
    chain2: setConnectorRPC(bridgeSetup.chain2.rpcUrl),
  };
};

export const setConnectorRPC = (rpcUrl: string, address?: string): Connector => {
  return Connector.initRPC(rpcUrl, address);
};

export const setConnectorWeb3 = (web3ProviderInstance: providers.ExternalProvider): Connector => {
  return Connector.initFromWeb3(web3ProviderInstance);
};

export const processAmountForERC20Transfer = (amount: string): string => {
  const parsedAmountToERC20Decimals = utils.parseUnits(amount.toString(), 18);

  const toBigNumber = BigNumber.from(parsedAmountToERC20Decimals);

  const toHexString = toBigNumber.toHexString();

  const amountTransformedToData = utils.hexZeroPad(toHexString, 32).substr(2);

  return amountTransformedToData;
};

export const processLenRecipientAddress = (recipientAddress: string): string => {
  const hexilifiedLenOfRecipientAddress = utils.hexlify((recipientAddress.length - 2) / 2);

  const toHexString = utils.hexZeroPad(hexilifiedLenOfRecipientAddress, 32).substr(2);

  return toHexString;
};

export async function listTokensOfOwner({
  token: tokenAddress,
  account,
  signer,
}: {
  token: string;
  account: string;
  signer: providers.Provider | providers.JsonRpcSigner;
}): Promise<[string]> {
  const token = ERC721MinterBurnerPauser__factory.connect(tokenAddress, signer);

  console.warn(await token.name(), 'tokens owned by', account);

  const sentLogs = await token.queryFilter(token.filters.Transfer(account, null));
  const receivedLogs = await token.queryFilter(token.filters.Transfer(null, account));

  const logs = sentLogs
    .concat(receivedLogs)
    .sort((a, b) => a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex);

  const owned = new Set();

  for (const log of logs) {
    const { from, to, tokenId } = log.args;

    if (addressEqual(to, account)) {
      owned.add(tokenId.toString());
    } else if (addressEqual(from, account)) {
      owned.delete(tokenId.toString());
    }
  }

  return [...owned] as [string];
}

function addressEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
