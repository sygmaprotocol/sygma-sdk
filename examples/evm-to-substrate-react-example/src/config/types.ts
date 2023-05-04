import { XcmMultiAssetIdType } from "@buildwithsygma/sygma-sdk-core/src/chains/Substrate";

export type SubstrateConfigAssetType = {
  assetName: string;
  assetId: number;
  xsmMultiAssetId: XcmMultiAssetIdType;
};

export type SubstrateConfigType = {
  domainId: string;
  appName: string;
  provider_socket: string;
  assets: SubstrateConfigAssetType[];
};