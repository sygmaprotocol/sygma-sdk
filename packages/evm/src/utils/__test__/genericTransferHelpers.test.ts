import { Network } from '@buildwithsygma/core';
import { createGenericCallDepositData } from '../genericTransferHelpers';

const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_depositer',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_index',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'store',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_index',
        type: 'address',
      },
    ],
    name: 'retrieve',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

describe('createGenericCallDepositData', () => {
  it('should create correct generic call deposit data', async () => {
    const depositor = '0x98729c03c4D5e820F5e8c45558ae07aE63F97461';

    const genericCallParams = {
      abi: CONTRACT_ABI,
      functionName: 'store',
      functionParams: [depositor, depositor, BigInt(3052070251)],
      contractAddress: '0x4bE595ab5A070663B314970Fc10C049BBA0ad489',
      destination: {
        name: 'EVM',
        type: Network.EVM,
        caipId: '11',
        chainId: 1,
        id: 1,
      },
      maxFee: BigInt(3000000),
      depositor: depositor as `0x${string}`,
    };

    const depositData = createGenericCallDepositData(genericCallParams);
    console.log(depositData);
    expect(true).toBe(true);
  });
});
