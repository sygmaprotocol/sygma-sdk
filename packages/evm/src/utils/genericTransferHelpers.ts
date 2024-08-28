import { Domain, Network } from '@buildwithsygma/core';
import { hexZeroPad } from '@ethersproject/bytes';
import { Abi } from 'abitype';
import { BigNumber, ethers } from 'ethers';

interface GenericDepositParams {
  abi: Abi;
  functionName: string;
  functionParams: Array<unknown> | any;
  contractAddress: string;
  destination: Domain;
  maxFee: BigInt;
  depositor: `0x${string}`;
}

const getZeroPaddedLength = (hexString: string, padding: number): string =>
  hexZeroPad(BigNumber.from(hexString.substring(2).length / 2).toHexString(), padding).substring(2);

export function createGenericCallDepositData(genericTransferParams: GenericDepositParams): string {
  const { abi, functionName, functionParams, contractAddress, maxFee, destination, depositor } =
    genericTransferParams;

  if (destination.type === Network.EVM) {
    const contractInterface = new ethers.utils.Interface(JSON.stringify(abi));

    const paddedMaxFee = hexZeroPad(BigNumber.from(maxFee).toHexString(), 32);
    const funcData = contractInterface.encodeFunctionData(functionName, functionParams);
    const funcSig = funcData.substring(0, 10);
    /** 0x (2) + function signature (8) + first param which is always set to depositer by relayer (64)  */
    const funcParamEncoded = funcData.substring(74);

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
