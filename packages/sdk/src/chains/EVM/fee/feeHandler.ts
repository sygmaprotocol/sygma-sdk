import { FeeHandlerRouter__factory } from '@buildwithsygma/sygma-contracts';
import { ethers } from 'ethers';

export const getFeeHandlerAddress = async (
  signerOrProvider: ethers.providers.JsonRpcProvider | ethers.Signer,
  feeRouterAddress: string,
  domainId: string,
  resourceId: string,
): Promise<string> => {
  const feeHandlerContract = FeeHandlerRouter__factory.connect(feeRouterAddress, signerOrProvider);
  let feeHandlerAddress: string;

  try {
    feeHandlerAddress = await feeHandlerContract._domainResourceIDToFeeHandlerAddress(
      domainId,
      resourceId,
    );

    return feeHandlerAddress;
  } catch (error) {
    console.warn('Error fetching fee handler address', error);
    return Promise.reject(error);
  }
};
