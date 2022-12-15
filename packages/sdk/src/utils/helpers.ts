import { utils, BigNumber } from 'ethers';

export const toHex = (covertThis: any, padding: any) => {
  return utils.hexZeroPad(utils.hexlify(BigNumber.from(covertThis)), padding);
};

export const addPadding = (covertThis: any, padding: number) => {
  return utils.hexZeroPad('0x' + covertThis, padding);
};

export const createResourceID = (contractAddress: string, domainID: number) => {
  return toHex(contractAddress + toHex(domainID, 1).substr(2), 32)
};

export const createERCDepositData = (tokenAmountOrID: string | number | BigNumber, lenRecipientAddress: number, recipientAddress: string) => {
  return '0x' +
    toHex(tokenAmountOrID, 32).substr(2) +      // Token amount or ID to deposit (32 bytes)
    toHex(lenRecipientAddress, 32).substr(2) + // len(recipientAddress)          (32 bytes)
    recipientAddress.substr(2);               // recipientAddress               (?? bytes)
};

export const createPermissionedGenericDepositData = (hexMetaData) => {
  if (hexMetaData === null) {
    return '0x' +
      toHex(0, 32).substr(2) // len(metaData) (32 bytes)
  }
  const hexMetaDataLength = (hexMetaData.substr(2)).length / 2;
  return '0x' +
    toHex(hexMetaDataLength, 32).substr(2) +
    hexMetaData.substr(2)
};

export const createPermissionlessGenericDepositData = (executeFunctionSignature: string, executeContractAddress: string, maxFee: string, depositor: string, executionData: string, depositorCheck: boolean = true) => {
  if (depositorCheck) {
    // if "depositorCheck" is true -> append depositor address for destination chain check
    executionData = executionData.concat(toHex(depositor, 32).substr(2));
  }

  return ('0x' +
    toHex(maxFee, 32).substr(2) +                                        // uint256
    toHex(executeFunctionSignature.substr(2).length / 2, 2).substr(2) +    // uint16
    executeFunctionSignature.substr(2) +                                 // bytes
    toHex(executeContractAddress.substr(2).length / 2, 1).substr(2) +      // uint8
    executeContractAddress.substr(2) +                                   // bytes
    toHex(32, 1).substr(2) +                                             // uint8
    toHex(depositor, 32).substr(2) +                                     // bytes32
    executionData.substr(2)                                              // bytes
  ).toLowerCase()
};