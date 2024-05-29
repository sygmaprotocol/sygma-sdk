import {
  Bridge__factory,
  BasicFeeHandler__factory,
  FeeHandlerRouter__factory,
} from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';

import MulticallAbi from './abi/Multicall.json';
import type { Eip1193Provider, FeeHandlerType, RouteIndexerType } from './types.js';

enum DeployedNetworks {
  mainnet = 1,
  ropsten = 3,
  rinkeby = 4,
  goerli = 5,
  optimism = 10,
  kovan = 42,
  matic = 137,
  kovanOptimism = 69,
  xdai = 100,
  xDaiTestnet = 10200,
  goerliOptimism = 420,
  sepoliaOptimism = 11155420,
  arbitrum = 42161,
  rinkebyArbitrum = 421611,
  goerliArbitrum = 421613,
  sepoliaArbitrum = 421614,
  mumbai = 80001,
  sepolia = 11155111,
  avalancheMainnet = 43114,
  avalancheFuji = 43113,
  fantomTestnet = 4002,
  fantom = 250,
  bsc = 56,
  bsc_testnet = 97,
  moonbeam = 1284,
  moonriver = 1285,
  moonbaseAlphaTestnet = 1287,
  harmony = 1666600000,
  cronos = 25,
  fuse = 122,
  songbirdCanaryNetwork = 19,
  costonTestnet = 16,
  boba = 288,
  aurora = 1313161554,
  astar = 592,
  okc = 66,
  heco = 128,
  metis = 1088,
  rsk = 30,
  rskTestnet = 31,
  evmos = 9001,
  evmosTestnet = 9000,
  thundercore = 108,
  thundercoreTestnet = 18,
  oasis = 26863,
  celo = 42220,
  godwoken = 71402,
  godwokentestnet = 71401,
  klatyn = 8217,
  milkomeda = 2001,
  kcc = 321,
  etherlite = 111,
  lineaTestnet = 59140,
  linea = 59144,
  scroll = 534352,
  scrollSepolia = 534351,
  zkSyncEra = 324,
  zkSyncEraTestnet = 280,
  // duplicate
  // zkSyncEraSepoliaTestnet = 300,
  starknet = 300,
  starknetTestnet = 301,
  shibarium = 109,
  mantle = 5000,
  mantleTestnet = 5001,
  base = 8453,
  baseTestnet = 84531,
  blastSepolia = 168587773,
  polygonZkEvm = 1101,
  polygonZkEvmTestnet = 1442,
  zora = 7777777,
  zoraTestnet = 999,
  flare = 14,
  pulsechain = 369,
  sapphire = 23294,
  blast = 81457,
  amoy = 80002,
}

function getMulticallAddress(chainId: DeployedNetworks): string {
  switch (chainId) {
    case DeployedNetworks.mainnet:
    case DeployedNetworks.ropsten:
    case DeployedNetworks.rinkeby:
    case DeployedNetworks.goerli:
    case DeployedNetworks.optimism:
    case DeployedNetworks.kovan:
    case DeployedNetworks.matic:
    case DeployedNetworks.kovanOptimism:
    case DeployedNetworks.xdai:
    case DeployedNetworks.xDaiTestnet:
    case DeployedNetworks.goerliOptimism:
    case DeployedNetworks.sepoliaOptimism:
    case DeployedNetworks.arbitrum:
    case DeployedNetworks.rinkebyArbitrum:
    case DeployedNetworks.goerliArbitrum:
    case DeployedNetworks.sepoliaArbitrum:
    case DeployedNetworks.mumbai:
    case DeployedNetworks.sepolia:
    case DeployedNetworks.avalancheMainnet:
    case DeployedNetworks.avalancheFuji:
    case DeployedNetworks.fantomTestnet:
    case DeployedNetworks.fantom:
    case DeployedNetworks.bsc:
    case DeployedNetworks.bsc_testnet:
    case DeployedNetworks.moonbeam:
    case DeployedNetworks.moonriver:
    case DeployedNetworks.moonbaseAlphaTestnet:
    case DeployedNetworks.harmony:
    case DeployedNetworks.cronos:
    case DeployedNetworks.fuse:
    case DeployedNetworks.songbirdCanaryNetwork:
    case DeployedNetworks.costonTestnet:
    case DeployedNetworks.boba:
    case DeployedNetworks.aurora:
    case DeployedNetworks.astar:
    case DeployedNetworks.okc:
    case DeployedNetworks.heco:
    case DeployedNetworks.metis:
    case DeployedNetworks.rsk:
    case DeployedNetworks.rskTestnet:
    case DeployedNetworks.evmos:
    case DeployedNetworks.evmosTestnet:
    case DeployedNetworks.thundercore:
    case DeployedNetworks.thundercoreTestnet:
    case DeployedNetworks.oasis:
    case DeployedNetworks.celo:
    case DeployedNetworks.godwoken:
    case DeployedNetworks.godwokentestnet:
    case DeployedNetworks.klatyn:
    case DeployedNetworks.milkomeda:
    case DeployedNetworks.kcc:
    case DeployedNetworks.lineaTestnet:
    case DeployedNetworks.linea:
    case DeployedNetworks.mantle:
    case DeployedNetworks.mantleTestnet:
    case DeployedNetworks.base:
    case DeployedNetworks.baseTestnet:
    case DeployedNetworks.blastSepolia:
    case DeployedNetworks.polygonZkEvm:
    case DeployedNetworks.polygonZkEvmTestnet:
    case DeployedNetworks.zora:
    case DeployedNetworks.zoraTestnet:
    case DeployedNetworks.flare:
    case DeployedNetworks.pulsechain:
    case DeployedNetworks.scroll:
    case DeployedNetworks.scrollSepolia:
    case DeployedNetworks.sapphire:
    case DeployedNetworks.blast:
    case DeployedNetworks.amoy:
      return '0xcA11bde05977b3631167028862bE2a173976CA11';
    case DeployedNetworks.etherlite:
      return '0x21681750D7ddCB8d1240eD47338dC984f94AF2aC';
    case DeployedNetworks.zkSyncEra:
    case DeployedNetworks.zkSyncEraTestnet:
      // case DeployedNetworks.zkSyncEraSepoliaTestnet:
      return '0xF9cda624FBC7e059355ce98a31693d299FACd963';
    case DeployedNetworks.shibarium:
      return '0xd1727fC8F78aBA7DD6294f6033D74c72Ccd3D3B0';
    case DeployedNetworks.starknet:
      return '0xc662c410C0ECf747543f5bA90660f6ABeBD9C8c4';
    case DeployedNetworks.starknetTestnet:
      return '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';

    default:
      throw new Error(
        `Network - ${chainId as number} doesn't have a multicall contract address defined. Please check your network or deploy your own contract on it.`,
      );
  }
}

export async function getFeeHandlerAddressesOfRoutes(params: {
  routes: RouteIndexerType[];
  chainId: number;
  bridgeAddress: string;
  provider: Eip1193Provider;
}): Promise<Array<RouteIndexerType & { feeHandlerAddress: string }>> {
  const web3Provider = new Web3Provider(params.provider);
  const bridge = Bridge__factory.connect(params.bridgeAddress, web3Provider);
  const feeHandlerRouterAddress = await bridge._feeHandler();
  const feeHandlerRouter = FeeHandlerRouter__factory.createInterface();

  const multicallAddress = getMulticallAddress(params.chainId);
  const multicall = new Contract(multicallAddress, JSON.stringify(MulticallAbi), web3Provider);

  const calls = [];
  for (let i = 0; i < params.routes.length; i++) {
    calls.push({
      target: feeHandlerRouterAddress,
      callData: feeHandlerRouter.encodeFunctionData('_domainResourceIDToFeeHandlerAddress', [
        parseInt(params.routes[i].toDomainId),
        params.routes[i].resourceId,
      ]),
    });
  }

  const results = (await multicall.callStatic.aggregate(calls)) as {
    returnData: Array<string>;
  };

  return params.routes.map((route, idx) => {
    return {
      ...route,
      feeHandlerAddress: defaultAbiCoder.decode(['address'], results.returnData[idx]).toString(),
    };
  });
}

export async function getFeeHandlerTypeOfRoutes(params: {
  routes: Array<RouteIndexerType & { feeHandlerAddress: string }>;
  chainId: number;
  provider: Eip1193Provider;
}): Promise<
  Array<RouteIndexerType & { feeHandlerAddress: string } & { feeHandlerType: FeeHandlerType }>
> {
  const web3Provider = new Web3Provider(params.provider);
  const multicallAddress = getMulticallAddress(params.chainId);
  const multicall = new Contract(multicallAddress, JSON.stringify(MulticallAbi), web3Provider);
  const basicFeeHandlerInterface = BasicFeeHandler__factory.createInterface();

  const calls = [];
  for (let i = 0; i < params.routes.length; i++) {
    calls.push({
      target: params.routes[i].feeHandlerAddress,
      callData: basicFeeHandlerInterface.encodeFunctionData('feeHandlerType'),
    });
  }

  const results = (await multicall.callStatic.aggregate(calls)) as {
    returnData: Array<string>;
  };

  return params.routes.map((route, idx) => {
    return {
      ...route,
      feeHandlerAddress: route.feeHandlerAddress,
      feeHandlerType: results.returnData[idx].toString() as FeeHandlerType,
    };
  });
}
