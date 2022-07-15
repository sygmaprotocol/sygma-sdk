import { Bridge } from '@chainsafe/chainbridge-contracts';
import { utils, BigNumber } from 'ethers';
import { Connector } from '../connectors';

import {
  BridgeData,
  BridgeEventCallback,
  BridgeEvents,
  Bridges,
  ChainbridgeContracts,
  ChainbridgeErc20Contracts,
  ChainbridgeProviders,
  Provider,
} from '../types';

export const computeBridges = (contracts: ChainbridgeContracts): Bridges =>
  Object.keys(contracts).reduce((bridges: any, chain) => {
    const { bridge } = contracts[chain];
    bridges = {
      ...bridges,
      [chain]: bridge,
    };

    return bridges;
  }, {});

export const computeERC20Contracts = (contracts: ChainbridgeContracts): ChainbridgeErc20Contracts =>
  Object.keys(contracts).reduce((erc20Contracts: any, chain) => {
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
): ChainbridgeProviders => {
  return {
    chain1: setConnectorRPC(bridgeSetup.chain1.rpcURL, address),
    chain2: setConnectorRPC(bridgeSetup.chain2.rpcURL, address),
  };
};

export const computeProvidersAndSignersWeb3 = (
  bridgeSetup: BridgeData,
  web3providerInstance: any,
): ChainbridgeProviders => {
  return {
    chain1: setConnectorWeb3(web3providerInstance),
    chain2: setConnectorRPC(bridgeSetup.chain2.rpcURL),
  };
};

export const setConnectorRPC = (rpcURL?: string, address?: string): Connector => {
  return Connector.initRPC(rpcURL, address);
};

export const setConnectorWeb3 = (web3ProviderInstance: any): Connector => {
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
