import { ERC721MinterBurnerPauser__factory } from '@buildwithsygma/sygma-contracts';
import { utils, BigNumber, providers } from 'ethers';
import { Connector } from '../connectors';

import { BridgeData, Bridges, SygmaContracts, SygmaErc20Contracts, SygmaProviders } from '../types';

/**
 * @deprecated since version 1.4.0
 * @name computeBridges
 * @description returns object with contracts sorted by chain
 * @param contracts - object with contracts
 * @returns {Bridges}
 */
export const computeBridges = (contracts: SygmaContracts): Bridges =>
  Object.keys(contracts).reduce((bridges, chain) => {
    const { bridge } = contracts[chain];
    bridges = {
      ...bridges,
      [chain]: bridge,
    };

    return bridges;
  }, {});

/**
 * @deprecated since version 1.4.0
 * @name computeERC20Contracts
 * @description returns object with ERC20 contracts sorted by chain
 * @param contracts - object with contracts
 * @returns {SygmaErc20Contracts}
 */
export const computeERC20Contracts = (contracts: SygmaContracts): SygmaErc20Contracts =>
  Object.keys(contracts).reduce((erc20Contracts, chain) => {
    const { erc20 } = contracts[chain];
    erc20Contracts = {
      ...erc20Contracts,
      [chain]: erc20,
    };

    return erc20Contracts;
  }, {});

/**
 * @deprecated since version 1.4.0
 * @name computeProvidersAndSignersRPC
 * @description returns object with RPC provider sorted by chain1 and chain2 descriptors
 * @param bridgeSetup - bridge data defined to use the SDK
 * @param address - account address
 * @returns {SygmaProviders}
 */
export const computeProvidersAndSignersRPC = (
  bridgeSetup: BridgeData,
  address?: string,
): SygmaProviders => {
  return {
    chain1: setConnectorRPC(bridgeSetup.chain1.rpcUrl, address),
    chain2: setConnectorRPC(bridgeSetup.chain2.rpcUrl, address),
  };
};

/**
 * @deprecated since version 1.4.0
 * @name computeProvidersAndSignersWeb3
 * @description returns object with Web3 providers sorted by chain1 and chain2 descriptors
 * @param bridgeSetup - bridge setup to use the SDK
 * @param web3providerInstance - web3 provider instance
 * @returns {SygmaProviders}
 */
export const computeProvidersAndSignersWeb3 = (
  bridgeSetup: BridgeData,
  web3providerInstance: providers.ExternalProvider,
): SygmaProviders => {
  return {
    chain1: setConnectorWeb3(web3providerInstance),
    chain2: setConnectorRPC(bridgeSetup.chain2.rpcUrl),
  };
};

/**
 * @deprecated since version 1.4.0
 * @name setConnectorRPC
 * @description connects to RPC node
 * @param rpcUrl
 * @param address
 * @returns {Connector}
 */
export const setConnectorRPC = (rpcUrl: string, address?: string): Connector => {
  return Connector.initRPC(rpcUrl, address);
};

/**
 * @deprecated since version 1.4.0
 * @name setConnectorWeb3
 * @description connects to web3 RCP
 * @param web3ProviderInstance
 * @returns {Connector}
 */
export const setConnectorWeb3 = (web3ProviderInstance: providers.ExternalProvider): Connector => {
  return Connector.initFromWeb3(web3ProviderInstance);
};

/**
 * @deprecated since version 1.4.0
 * @name processAmountForERC20Transfer
 * @description prepares the amount of data to tranfer for ERC20 token
 * @param amount
 * @returns {string}
 */
export const processAmountForERC20Transfer = (amount: string): string => {
  const parsedAmountToERC20Decimals = utils.parseUnits(amount.toString(), 18);
  const hexString = BigNumber.from(parsedAmountToERC20Decimals).toHexString();
  return utils.hexZeroPad(hexString, 32).substring(2);
};

/**
 * @deprecated since version 1.4.0
 * @name processLenRecipientAddress
 * @description returns hex data of the recipient address
 * @param recipientAddress
 * @returns {string}
 */
export const processLenRecipientAddress = (recipientAddress: string): string => {
  const hexilifiedLenOfRecipientAddress = utils.hexlify((recipientAddress.length - 2) / 2);
  return utils.hexZeroPad(hexilifiedLenOfRecipientAddress, 32).substring(2);
};

/**
 * @deprecated since version 1.4.0
 * @name listTokensOfOwner
 * @description list the tokens of the account
 * @param {Object}
 * @returns {Promise<[string]>}
 */
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

/**
 * @deprecated since version 1.4.0
 * @name addressEqual
 * @description check if address are the samep
 * @param a - address
 * @param b - address
 * @returns {boolena}
 */
function addressEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
