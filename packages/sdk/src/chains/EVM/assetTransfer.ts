import { Provider } from '@ethersproject/providers';
import { UnsignedTransaction, ethers, providers } from 'ethers';
import { Transfer } from 'types';

export type EvmFee = {
  amount: string
}

export class EVMAssetTransfer {
  public environment: unknown;

  private provider: providers.Provider;

  constructor(environment: unknown, provider: Provider) {
    this.environment = environment;
    this.provider = provider;
  }

  public async getApprovals(transfer: Transfer): Promise<Array<UnsignedTransaction>> {
    return []
  }

  public async getFee(transfer: Transfer): Promise<EvmFee> {
    return {
      amount: "30000"
    }
  }

  public async buildTransferTransaction(transfer: Transfer): Promise<unknown> {
    return
  }

  // public async buildTransferTransaction(transfer: Transfer) Promise<UnsignedTransaction> {}
}
