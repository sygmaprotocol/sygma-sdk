export type Domain = {
  id: number;
  name: string;
};

export enum ResourceType {
  FUNGIBLE = 'fungible',
  NON_FUNGIBLE = 'nonfungible',
  PERMISSIONED_GENERIC = 'permissionedGeneric',
  PERMISSIONLESS_GENERIC = 'permissionlessGeneric',
}

export type Resource = {
  resourceId: string;
  type: ResourceType;
  address: string;
  symbol?: string;
  decimals?: number;
};

export enum FeeHandlerType {
  ORACLE = 'oracle',
  BASIC = 'basic',
}
