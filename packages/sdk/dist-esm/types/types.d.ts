import type { ParachainID, XcmMultiAssetIdType } from 'chains/Substrate/types';
import type { Network } from './config.js';
export type Domain = {
    id: number;
    chainId: number;
    name: string;
    type: Network;
};
export type Recipient = {
    address: string;
    parachainId?: number;
};
export declare enum ResourceType {
    FUNGIBLE = "fungible",
    NON_FUNGIBLE = "nonfungible",
    PERMISSIONED_GENERIC = "permissionedGeneric",
    PERMISSIONLESS_GENERIC = "permissionlessGeneric"
}
export declare enum SubstrateParachain {
    LOCAL = 5,
    ROCOCO_PHALA = 5231
}
export type Resource = EvmResource | SubstrateResource;
interface BaseResource {
    resourceId: string;
    type: ResourceType;
    native?: boolean;
    burnable?: boolean;
    symbol?: string;
    decimals?: number;
}
export type EvmResource = BaseResource & {
    address: string;
};
export type SubstrateResource = BaseResource & {
    assetID?: number;
    assetName: string;
    xcmMultiAssetId: XcmMultiAssetIdType;
};
export declare enum FeeHandlerType {
    DYNAMIC = "oracle",
    BASIC = "basic",
    PERCENTAGE = "percentage",
    UNDEFINED = "undefined"
}
type AssetTransfer = {
    recipient: string;
    parachainId?: ParachainID;
};
export type Fungible = AssetTransfer & {
    amount: string;
};
export type NonFungible = AssetTransfer & {
    tokenId: string;
};
export type GenericMessage = {
    destinationContractAddress: string;
    destinationFunctionSignature: string;
    executionData: string;
    maxFee: string;
    tokenAmount: string;
};
export type TransferType = Fungible | NonFungible | GenericMessage;
export type Transfer<TransferType> = {
    details: TransferType;
    to: Domain;
    from: Domain;
    resource: Resource;
    sender: string;
};
export type LiquidityError = Error & {
    maximumTransferAmount: bigint;
};
export type TransferStatus = 'pending' | 'executed' | 'failed';
export type TransferStatusResponse = {
    status: TransferStatus;
    explorerUrl: string;
    fromDomainId: number;
    toDomainId: number;
};
export type RouteIndexerType = {
    fromDomainId: string;
    toDomainId: string;
    resourceId: string;
    type: string;
};
export type DomainMetadata = {
    url: string;
};
export type EnvironmentMetadata = {
    [key: number]: DomainMetadata;
};
export type Route = {
    fromDomain: Domain;
    toDomain: Domain;
    resource: Resource;
};
export {};
//# sourceMappingURL=types.d.ts.map