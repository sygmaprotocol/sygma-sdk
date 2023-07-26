import { JsonRpcProvider, Provider } from '@ethersproject/providers';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ERC20__factory } from '@buildwithsygma/sygma-contracts';
import { Config } from '../config';
import {
  Environment,
  EvmResource,
  Fungible,
  Network,
  ResourceType,
  SubstrateResource,
  Transfer,
  TransferType,
} from '../types';
import { getAssetBalance } from './Substrate/utils/getAssetBalance';
import { getNativeTokenBalance } from './Substrate/utils/getNativeTokenBalance';
import { BigNumber } from 'ethers';

export abstract class BaseAssetTransfer {
  public config!: Config;
  public environment!: Environment;

  /**
   * Creates a Transfer<Fungible> object which can then be used to estimate transfer
   * fees as well as create the necessary desposit and approval transactions.
   *
   * @category Bridge deposit
   * @param {string} sourceAddress - The address of the sender
   * @param {number} destinationChainId - The (Para)ChainId of the destination chain
   * @param {string} destinationAddress - The address of the recipient on the destination chain
   * @param {string} resourceId - The ID of the resource being transferred
   * @param {string} amount - The amount of tokens to be transferred. The amount should be in the lowest denomination possible on the source chain. If the token on source chain is configured to use 12 decimals and the amount to be transferred is 1 ETH, then amount should be passed in as 1000000000000
   * @returns {Transfer<Fungible>} - The populated transfer object
   * @throws {Error} - Source domain not supported, Destination domain not supported, Resource not supported
   */
  public createFungibleTransfer(
    sourceAddress: string,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: string,
  ): Transfer<Fungible> {
    const { sourceDomain, destinationDomain, resource } = this.config.getBaseTransferParams(
      destinationChainId,
      resourceId,
    );

    const transfer: Transfer<Fungible> = {
      sender: sourceAddress,
      details: {
        amount,
        recipient: destinationAddress,
      },
      from: sourceDomain,
      to: destinationDomain,
      resource: resource,
    };

    return transfer;
  }

  async checkDestinationChainBalance(
    transfer: Transfer<TransferType>,
    destinationProviderUrl: string,
  ): Promise<boolean> {
    const destinationDomain = this.config.getDomainConfig(transfer.to.id);
    const handlerAddress = destinationDomain.handlers.find(
      h => h.type === ResourceType.FUNGIBLE,
    )?.address;

    if (!handlerAddress) {
      throw new Error('No ERC20 handler configured');
    }

    const destinationResource = destinationDomain.resources.find(
      r => r.resourceId === transfer.resource.resourceId,
    );

    if (destinationResource?.burnable) {
      return true;
    }

    let handlerBalance;
    let providerOrApiPromise;

    switch (destinationDomain.type) {
      case Network.EVM:
        providerOrApiPromise = new JsonRpcProvider(destinationProviderUrl);
        if (destinationResource?.native) {
          handlerBalance = await (providerOrApiPromise as Provider).getBalance(handlerAddress);
        } else {
          const tokenAddress = (transfer.resource as EvmResource).address;
          const erc20Contract = ERC20__factory.connect(
            tokenAddress,
            providerOrApiPromise as Provider,
          );
          handlerBalance = await erc20Contract.balanceOf(handlerAddress);
        }
        break;
      case Network.SUBSTRATE: {
        const wsProvider = new WsProvider(destinationProviderUrl);
        providerOrApiPromise = new ApiPromise({ provider: wsProvider });
        if (destinationResource?.native) {
          const accountInfo = await getNativeTokenBalance(providerOrApiPromise, handlerAddress);
          handlerBalance = BigNumber.from(accountInfo.free.toString());
        } else {
          const assetBalance = await getAssetBalance(
            providerOrApiPromise,
            (transfer.resource as SubstrateResource).assetId ?? 0,
            handlerAddress,
          );
          handlerBalance = BigNumber.from(assetBalance.balance.toString());
        }
        break;
      }
    }

    if (handlerBalance.lt((transfer as Transfer<Fungible>).details.amount)) {
      return false;
    }
    return true;
  }
}
