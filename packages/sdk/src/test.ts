import { JsonRpcProvider, TransactionRequest } from '@ethersproject/providers';
import { Wallet } from 'ethers';

import { EVMAssetTransfer } from './chains/EVM';
import { Environment, FungibleAssetAmount, ResourceType, Transfer } from './types';

export async function test(): Promise<void> {
  const provider = new JsonRpcProvider('https://rpc.api.moonbase.moonbeam.network	');
  const wallet = new Wallet(
    'f6fddad2632286f2b54233a0c4afe35da521c484efeeb8422630e65e520adf98',
    provider,
  );
  const assetTransfer = new EVMAssetTransfer(provider);
  await assetTransfer.init(Environment.DEVNET);
  const transfer: Transfer<FungibleAssetAmount> = {
    to: {
      name: 'Sepolia',
      id: '3',
    },
    from: {
      name: 'Mumbai',
      id: '2',
    },
    resource: {
      resourceId: '0x0000000000000000000000000000000000000000000000000000000000000300',
      address: '0x3690601896C289be2d894c3d1213405310D0a25C',
      type: ResourceType.FUNGIBLE,
      symbol: 'LR',
      decimals: 18,
    },
    sender: await wallet.getAddress(),
    recipient: '0x557abEc0cb31Aa925577441d54C090987c2ED818',
    amount: {
      amount: '200',
    },
  };
  const fee = await assetTransfer.getFee(transfer);
  const approvals = await assetTransfer.buildApprovals(transfer, fee);
  for (const approval of approvals) {
    await wallet.sendTransaction(approval as TransactionRequest);
  }
  const transferTx = await assetTransfer.buildTransferTransaction(transfer, fee);
  const response = await wallet.sendTransaction(transferTx as TransactionRequest);
  console.log('DEPOSIT HASH');
  console.log(response.hash);
}

test()
  .catch(reason => {
    console.log(reason);
  })
  .finally(() => {
    console.log('final');
  });
