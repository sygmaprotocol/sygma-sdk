import type {
  Domain,
  EvmResource,
  FeeHandlerType,
} from "@buildwithsygma/sygma-sdk-core";

/* eslint-disable @typescript-eslint/no-unused-vars */
interface TransactionRequest {
  to: string;
  value: bigint;
  data: string;
  gasLimit: bigint;
}

interface Eip1193Provider {
  request(request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}

type EvmFee = {
  fee: bigint;
  type: FeeHandlerType;
  handlerAddress: string;
  tokenAddress?: string;
  percentage?: number;
  minFee?: bigint;
  maxFee?: bigint;
};

/**
 * Return amount of liqudiity tokens on resource handler
 * @param provider
 * @param resource
 */
export function getLiquidity(
  provider: Eip1193Provider,
  resource: EvmResource,
): Promise<bigint> {
  throw new Error("Method not implemented");
}

export function createEvmFungibleAssetTransfer(
  source: string | number | Domain,
  sourceNetworkProvider: Eip1193Provider,
  destination: string | number | Domain,
  resource: string | EvmResource,
  amount: bigint,
  destinationAddress: string,
): Promise<EvmFungibleAssetTransfer> {
  throw new Error("Method not implemented");
}

/**
 * @dev User should not instance this directly. All the (async) checks should be done in `createEvmFungibleAssetTransfer`
 */
export abstract class EvmFungibleAssetTransfer {
  constructor(
    sourceDomain: string | number | Domain,
    sourceNetworkProvider: Eip1193Provider,
    destinationDomain: string | number | Domain,
    resource: string | EvmResource,
    amount: bigint,
    destinationAddress: string,
  ) {}

  setAmount(amount: bigint): this {
    throw new Error("Method not implemented");
  }
  setResource(resource: EvmResource): this {
    throw new Error("Method not implemented");
  }
  setDesinationDomain(destinationDomain: string | number | Domain): this {
    throw new Error("Method not implemented");
  }
  setDestinationAddress(destinationAddress: string): this {
    throw new Error("Method not implemented");
  }

  /**
   * Returns fee based on transfer amount.
   * @param amount By default it is original amount passed in constructor
   */
  getFee(amount?: bigint): Promise<EvmFee> {
    throw new Error("Method not implemented");
  }
  /**
   * Returns array of required approval transactions
   * @dev with permit2 we would add TypedData in the array to be signed and signature will be mandatory param into getTransaferTransaction
   * @dev potentially add optional param to override transaction params
   */
  getApprovalTransactions(): Promise<Array<TransactionRequest>> {
    throw new Error("Method not implemented");
  }

  /**
   * Returns transaction to be signed by the user
   * @dev potentially add optional param to override transaction params
   */
  getTransferTransaction(): Promise<TransactionRequest> {
    throw new Error("Method not implemented");
  }
}
