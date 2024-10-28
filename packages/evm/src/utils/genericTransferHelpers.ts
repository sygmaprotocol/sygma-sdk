import type { Domain } from '@buildwithsygma/core';
import { Network } from '@buildwithsygma/core';
import { hexZeroPad } from '@ethersproject/bytes';
import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { BigNumber, ethers } from 'ethers';

interface GenericDepositParams<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
> {
  abi: Abi;
  functionName: string;
  functionParams: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<ContractAbi, FunctionName>['inputs'],
    'inputs'
  >;
  contractAddress: string;
  destination: Domain;
  maxFee: bigint;
  depositor: `0x${string}`;
}

const getZeroPaddedLength = (hexString: string, padding: number): string =>
  hexZeroPad(BigNumber.from(hexString.substring(2).length / 2).toHexString(), padding).substring(2);

export function createGenericCallDepositData<
  ContractAbi extends Abi,
  FunctionName extends ExtractAbiFunctionNames<ContractAbi, 'nonpayable' | 'payable'>,
>(genericTransferParams: GenericDepositParams<ContractAbi, FunctionName>): string {
  const { abi, functionName, functionParams, contractAddress, maxFee, destination, depositor } =
    genericTransferParams;

  if (destination.type === Network.EVM) {
    const contractInterface = new ethers.utils.Interface(JSON.stringify(abi));

    const paddedMaxFee = hexZeroPad(BigNumber.from(maxFee).toHexString(), 32);
    const funcData = contractInterface.encodeFunctionData(
      functionName,
      functionParams as unknown as Array<unknown>,
    );
    const funcSig = funcData.substring(0, 10);
    /** 0x (2) + function signature (8)  */
    const funcParamEncoded = funcData.substring(10);

    const funcSigLen = getZeroPaddedLength(funcSig, 2);
    const contractAddrLen = getZeroPaddedLength(contractAddress, 1);
    const dataDepositorLen = getZeroPaddedLength(depositor, 1);

    return (
      paddedMaxFee +
      funcSigLen +
      funcSig.substring(2) +
      contractAddrLen +
      contractAddress.substring(2) +
      dataDepositorLen +
      depositor.substring(2) +
      funcParamEncoded
    );
  }

  throw new Error('Unsupported destination network type.');
}
