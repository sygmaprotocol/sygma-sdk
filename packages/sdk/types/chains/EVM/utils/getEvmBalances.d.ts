import { JsonRpcProvider } from '@ethersproject/providers';
import type { EvmResource } from 'types';
export declare const getEvmHandlerBalance: (destinationProviderUrl: string, resource: EvmResource, handlerAddress: string) => Promise<bigint>;
export declare const getEvmErc20Balance: (address: string, tokenAddress: string, provider: JsonRpcProvider) => Promise<bigint>;
//# sourceMappingURL=getEvmBalances.d.ts.map