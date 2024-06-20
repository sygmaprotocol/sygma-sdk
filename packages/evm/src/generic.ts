import { Config } from "@buildwithsygma/core";
import { BaseTransfer, BaseTransferParams } from "base-transfer";
import { Eip1193Provider, EvmFee, TransactionRequest } from "types";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { erc20Abi } from "abitype/abis";

interface GenericMessageTransferRequest<T extends Abi> extends BaseTransferParams {
    gasLimit: bigint;
    functionParameters: Array<unknown>;
    //type should depend on submitted abi generic
    functionName: string;
    //find correct typing, make it generic
    destinationContractAbi: T;
    destinationContractAddress: string;

}

export async function createCrossChainContractCall<T extends Abi>(request: GenericMessageTransferRequest<T>): Promise<GenericMessageTransfer<T>> {
    const config = new Config();
    const genericTransfer = new GenericMessageTransfer<T>(request, config);
    return genericTransfer;
}

class GenericMessageTransfer<T extends Abi> extends BaseTransfer {
    destinationContractAddress: string;
    gasLimit: bigint;
    functionName: ExtractAbiFunctionNames<T>;
    destinationContractAbi: T;
    // functionParameters: AbiParametersToPrimitiveTypes<ExtractAbiFunction<T, typeof this.functionName>['inputs'], 'inputs'>;
    functionParameters: Array<unknown>;

    constructor(params: GenericMessageTransferRequest<T>, config: Config) {
        super(params, config);
        this.destinationContractAddress = params.destinationContractAddress;
        this.gasLimit = params.gasLimit;
        this.functionParameters = params.functionParameters;
        this.functionName = params.functionName;
        this.destinationContractAbi = params.destinationContractAbi;
    }

    async getTransferTransaction(): Promise<TransactionRequest> {
        throw new Error('Method not implemented.');
    }

    async getFee(gasLimit?: bigint): Promise<EvmFee> {
        throw new Error('Method not implemented.');
    }

    setDestinationContractAddress(contractAddress: string) {
        this.destinationContractAddress = contractAddress;
    }

    setDestinationContractAbi(contractAbi: T): void {
        this.destinationContractAbi = contractAbi;
    }

    setExecutionFunctionName(name: ExtractAbiFunctionNames<T>): void {
        this.functionName = name;
    }

    setFunctionExecutionParameters(parameters: Array<unknown>): void {
        this.functionParameters = parameters
    }

    getTransaction(): Promise<TransactionRequest> {
        throw new Error('Method not implemented.');
    }
}
