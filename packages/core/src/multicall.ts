import {
  BasicFeeHandler__factory,
  Bridge__factory,
  FeeHandlerRouter__factory,
} from '@buildwithsygma/sygma-contracts';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';

import MulticallAbi from './abi/Multicall.json';
import type { Eip1193Provider, FeeHandlerType, RouteIndexerType } from './types.js';

enum MulticallDeployedNetworks {
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

function getMulticallAddress(chainId: MulticallDeployedNetworks): string {
  switch (chainId) {
    case MulticallDeployedNetworks.mainnet:
    case MulticallDeployedNetworks.ropsten:
    case MulticallDeployedNetworks.rinkeby:
    case MulticallDeployedNetworks.goerli:
    case MulticallDeployedNetworks.optimism:
    case MulticallDeployedNetworks.kovan:
    case MulticallDeployedNetworks.matic:
    case MulticallDeployedNetworks.kovanOptimism:
    case MulticallDeployedNetworks.xdai:
    case MulticallDeployedNetworks.xDaiTestnet:
    case MulticallDeployedNetworks.goerliOptimism:
    case MulticallDeployedNetworks.sepoliaOptimism:
    case MulticallDeployedNetworks.arbitrum:
    case MulticallDeployedNetworks.rinkebyArbitrum:
    case MulticallDeployedNetworks.goerliArbitrum:
    case MulticallDeployedNetworks.sepoliaArbitrum:
    case MulticallDeployedNetworks.mumbai:
    case MulticallDeployedNetworks.sepolia:
    case MulticallDeployedNetworks.avalancheMainnet:
    case MulticallDeployedNetworks.avalancheFuji:
    case MulticallDeployedNetworks.fantomTestnet:
    case MulticallDeployedNetworks.fantom:
    case MulticallDeployedNetworks.bsc:
    case MulticallDeployedNetworks.bsc_testnet:
    case MulticallDeployedNetworks.moonbeam:
    case MulticallDeployedNetworks.moonriver:
    case MulticallDeployedNetworks.moonbaseAlphaTestnet:
    case MulticallDeployedNetworks.harmony:
    case MulticallDeployedNetworks.cronos:
    case MulticallDeployedNetworks.fuse:
    case MulticallDeployedNetworks.songbirdCanaryNetwork:
    case MulticallDeployedNetworks.costonTestnet:
    case MulticallDeployedNetworks.boba:
    case MulticallDeployedNetworks.aurora:
    case MulticallDeployedNetworks.astar:
    case MulticallDeployedNetworks.okc:
    case MulticallDeployedNetworks.heco:
    case MulticallDeployedNetworks.metis:
    case MulticallDeployedNetworks.rsk:
    case MulticallDeployedNetworks.rskTestnet:
    case MulticallDeployedNetworks.evmos:
    case MulticallDeployedNetworks.evmosTestnet:
    case MulticallDeployedNetworks.thundercore:
    case MulticallDeployedNetworks.thundercoreTestnet:
    case MulticallDeployedNetworks.oasis:
    case MulticallDeployedNetworks.celo:
    case MulticallDeployedNetworks.godwoken:
    case MulticallDeployedNetworks.godwokentestnet:
    case MulticallDeployedNetworks.klatyn:
    case MulticallDeployedNetworks.milkomeda:
    case MulticallDeployedNetworks.kcc:
    case MulticallDeployedNetworks.lineaTestnet:
    case MulticallDeployedNetworks.linea:
    case MulticallDeployedNetworks.mantle:
    case MulticallDeployedNetworks.mantleTestnet:
    case MulticallDeployedNetworks.base:
    case MulticallDeployedNetworks.baseTestnet:
    case MulticallDeployedNetworks.blastSepolia:
    case MulticallDeployedNetworks.polygonZkEvm:
    case MulticallDeployedNetworks.polygonZkEvmTestnet:
    case MulticallDeployedNetworks.zora:
    case MulticallDeployedNetworks.zoraTestnet:
    case MulticallDeployedNetworks.flare:
    case MulticallDeployedNetworks.pulsechain:
    case MulticallDeployedNetworks.scroll:
    case MulticallDeployedNetworks.scrollSepolia:
    case MulticallDeployedNetworks.sapphire:
    case MulticallDeployedNetworks.blast:
    case MulticallDeployedNetworks.amoy:
      return '0xcA11bde05977b3631167028862bE2a173976CA11';
    case MulticallDeployedNetworks.etherlite:
      return '0x21681750D7ddCB8d1240eD47338dC984f94AF2aC';
    case MulticallDeployedNetworks.zkSyncEra:
    case MulticallDeployedNetworks.zkSyncEraTestnet:
      // case MulticallDeployedNetworks.zkSyncEraSepoliaTestnet:
      return '0xF9cda624FBC7e059355ce98a31693d299FACd963';
    case MulticallDeployedNetworks.shibarium:
      return '0xd1727fC8F78aBA7DD6294f6033D74c72Ccd3D3B0';
    case MulticallDeployedNetworks.starknet:
      return '0xc662c410C0ECf747543f5bA90660f6ABeBD9C8c4';
    case MulticallDeployedNetworks.starknetTestnet:
      return '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';

    default:
      throw new Error(
        `Network - ${chainId as number} doesn't have a multicall contract address defined. Please check your network or deploy your own contract on it.`,
      );
  }
}

type AggregateStaticCallResponse = {
  returnData: Array<string>;
};

type IndexerRouteWithFeeHandlerAddress = RouteIndexerType & { feeHandlerAddress: string };
type IndexerRouteWithFeeHandlerAddressAndType = IndexerRouteWithFeeHandlerAddress & {
  feeHandlerType: FeeHandlerType;
};

export async function getFeeHandlerAddressesOfRoutes(params: {
  routes: RouteIndexerType[];
  chainId: number;
  bridgeAddress: string;
  provider: Eip1193Provider;
}): Promise<Array<IndexerRouteWithFeeHandlerAddress>> {
  const web3Provider = new Web3Provider(params.provider);
  const bridge = Bridge__factory.connect(params.bridgeAddress, web3Provider);
  const feeHandlerRouterAddress = await bridge._feeHandler();
  const feeHandlerRouter = FeeHandlerRouter__factory.createInterface();

  const multicallAddress = getMulticallAddress(params.chainId);
  const multicall = new Contract(multicallAddress, JSON.stringify(MulticallAbi), web3Provider);

  const calls = params.routes.map(route => ({
    target: feeHandlerRouterAddress,
    callData: feeHandlerRouter.encodeFunctionData('_domainResourceIDToFeeHandlerAddress', [
      parseInt(route.toDomainId),
      route.resourceId,
    ]),
  }));

  const results = (await multicall.callStatic.aggregate(calls)) as AggregateStaticCallResponse;
  return params.routes.map((route, idx) => {
    return {
      ...route,
      feeHandlerAddress: defaultAbiCoder.decode(['address'], results.returnData[idx]).toString(),
    };
  });
}

export async function getFeeHandlerTypeOfRoutes(params: {
  routes: Array<IndexerRouteWithFeeHandlerAddress>;
  chainId: number;
  provider: Eip1193Provider;
}): Promise<Array<IndexerRouteWithFeeHandlerAddressAndType>> {
  const web3Provider = new Web3Provider(params.provider);
  const multicallAddress = getMulticallAddress(params.chainId);
  const multicall = new Contract(multicallAddress, JSON.stringify(MulticallAbi), web3Provider);
  const basicFeeHandlerInterface = BasicFeeHandler__factory.createInterface();

  const calls = params.routes.map(route => ({
    target: route.feeHandlerAddress,
    callData: basicFeeHandlerInterface.encodeFunctionData('feeHandlerType'),
  }));

  const results = (await multicall.callStatic.aggregate(calls)) as AggregateStaticCallResponse;

  return params.routes.map((route, idx) => {
    return {
      ...route,
      feeHandlerAddress: route.feeHandlerAddress,
      feeHandlerType: results.returnData[idx].toString() as FeeHandlerType,
    };
  });
}
